/**
 * WordPress to AfricaVet CMS Import Script
 *
 * Usage: node scripts/import-wordpress.js ../africavetportaildelamedecinevtrinaireenafrique.WordPress.2026-02-13.xml
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { parseString } = require('xml2js');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'africavet',
    password: process.env.DB_PASSWORD || 'devpassword',
    database: process.env.DB_NAME || 'africavet_cms',
    charset: 'utf8mb4'
};

// Stats
const stats = {
    authors: { found: 0, created: 0, mapped: 0 },
    categories: { found: 0, created: 0 },
    posts: { found: 0, created: 0, skipped: 0 },
    images: { found: 0, downloaded: 0, failed: 0 }
};

// Mappings
const authorMapping = {}; // wp_id -> db_id
const categoryMapping = {}; // wp_slug -> db_id
const attachmentMapping = {}; // wp_post_id -> url

// Helper to extract CDATA content
function extractCDATA(value) {
    if (!value) return '';
    if (Array.isArray(value)) value = value[0];
    if (typeof value === 'string') return value;
    if (value._ !== undefined) return value._;
    return '';
}

// Helper to clean WordPress Gutenberg blocks
function cleanContent(content) {
    if (!content) return '';

    // Remove WordPress Gutenberg comments
    content = content.replace(/<!--\s*wp:[^>]*-->/g, '');
    content = content.replace(/<!--\s*\/wp:[^>]*-->/g, '');

    // Clean up extra whitespace
    content = content.replace(/\n{3,}/g, '\n\n');

    return content.trim();
}

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 200);
}

// Download image
async function downloadImage(url, destFolder) {
    return new Promise((resolve, reject) => {
        if (!url || !url.startsWith('http')) {
            return reject(new Error('Invalid URL'));
        }

        const filename = path.basename(url.split('?')[0]);
        const destPath = path.join(destFolder, filename);

        // Skip if already exists
        if (fs.existsSync(destPath)) {
            return resolve({ filename, path: destPath, url: `/uploads/wordpress/${filename}` });
        }

        const protocol = url.startsWith('https') ? https : http;

        const request = protocol.get(url, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = response.headers.location;
                if (redirectUrl) {
                    return downloadImage(redirectUrl, destFolder).then(resolve).catch(reject);
                }
            }

            if (response.statusCode !== 200) {
                return reject(new Error(`HTTP ${response.statusCode}`));
            }

            const file = fs.createWriteStream(destPath);
            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve({ filename, path: destPath, url: `/uploads/wordpress/${filename}` });
            });

            file.on('error', (err) => {
                fs.unlink(destPath, () => {});
                reject(err);
            });
        });

        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Timeout'));
        });
    });
}

// Main import function
async function importWordPress(xmlFile) {
    console.log('========================================');
    console.log('WordPress to AfricaVet Import');
    console.log('========================================\n');

    // Read XML file
    console.log(`Reading XML file: ${xmlFile}`);
    const xmlContent = fs.readFileSync(xmlFile, 'utf8');

    // Parse XML
    console.log('Parsing XML...');
    const result = await new Promise((resolve, reject) => {
        parseString(xmlContent, { explicitArray: false }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });

    const channel = result.rss.channel;
    console.log(`Site: ${channel.title}`);
    console.log(`URL: ${channel.link}\n`);

    // Connect to database
    console.log('Connecting to database...');
    const db = await mysql.createConnection(dbConfig);
    console.log('Connected!\n');

    // Create uploads folder for WordPress images
    const uploadsFolder = path.join(__dirname, '../uploads/wordpress');
    if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder, { recursive: true });
    }

    // Create post_categories table if not exists
    console.log('Creating post_categories table if needed...');
    await db.execute(`
        CREATE TABLE IF NOT EXISTS post_categories (
            post_id INT NOT NULL,
            category_id INT NOT NULL,
            PRIMARY KEY (post_id, category_id),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
    `);

    // Add bilingual columns to posts if not exist
    try {
        await db.execute(`ALTER TABLE posts ADD COLUMN title_fr VARCHAR(255) AFTER title`);
        await db.execute(`ALTER TABLE posts ADD COLUMN title_en VARCHAR(255) AFTER title_fr`);
        await db.execute(`ALTER TABLE posts ADD COLUMN content_fr LONGTEXT AFTER content`);
        await db.execute(`ALTER TABLE posts ADD COLUMN content_en LONGTEXT AFTER content_fr`);
        await db.execute(`ALTER TABLE posts ADD COLUMN excerpt_fr TEXT AFTER excerpt`);
        await db.execute(`ALTER TABLE posts ADD COLUMN excerpt_en TEXT AFTER excerpt_fr`);
        console.log('Added bilingual columns to posts table');
    } catch (e) {
        // Columns may already exist
    }

    // Add bilingual columns to categories if not exist
    try {
        await db.execute(`ALTER TABLE categories ADD COLUMN name_fr VARCHAR(100) AFTER name`);
        await db.execute(`ALTER TABLE categories ADD COLUMN name_en VARCHAR(100) AFTER name_fr`);
        console.log('Added bilingual columns to categories table');
    } catch (e) {
        // Columns may already exist
    }

    // ==========================================
    // 1. IMPORT AUTHORS
    // ==========================================
    console.log('\n--- Importing Authors ---');
    let authors = channel['wp:author'];
    if (!Array.isArray(authors)) authors = authors ? [authors] : [];
    stats.authors.found = authors.length;

    for (const author of authors) {
        const wpId = extractCDATA(author['wp:author_id']);
        const login = extractCDATA(author['wp:author_login']);
        const email = extractCDATA(author['wp:author_email']);
        const displayName = extractCDATA(author['wp:author_display_name']);
        const firstName = extractCDATA(author['wp:author_first_name']);
        const lastName = extractCDATA(author['wp:author_last_name']);

        // Check if user exists by email
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            authorMapping[wpId] = existing[0].id;
            stats.authors.mapped++;
            console.log(`  Mapped existing: ${login} -> ID ${existing[0].id}`);
        } else {
            // Create new user
            const password = await bcrypt.hash('changeme123', 10);
            const username = login.replace(/[^a-zA-Z0-9._-]/g, '').substring(0, 50);

            try {
                const [result] = await db.execute(
                    `INSERT INTO users (username, email, password, first_name, last_name, role, status)
                     VALUES (?, ?, ?, ?, ?, 'author', 'active')`,
                    [username, email, password, firstName || displayName, lastName || '']
                );
                authorMapping[wpId] = result.insertId;
                stats.authors.created++;
                console.log(`  Created: ${login} -> ID ${result.insertId}`);
            } catch (e) {
                // Username conflict - append number
                const uniqueUsername = `${username}_${Date.now()}`;
                const [result] = await db.execute(
                    `INSERT INTO users (username, email, password, first_name, last_name, role, status)
                     VALUES (?, ?, ?, ?, ?, 'author', 'active')`,
                    [uniqueUsername, email, password, firstName || displayName, lastName || '']
                );
                authorMapping[wpId] = result.insertId;
                stats.authors.created++;
                console.log(`  Created: ${uniqueUsername} -> ID ${result.insertId}`);
            }
        }
    }

    // ==========================================
    // 2. IMPORT CATEGORIES
    // ==========================================
    console.log('\n--- Importing Categories ---');
    let categories = channel['wp:category'];
    if (!Array.isArray(categories)) categories = categories ? [categories] : [];
    stats.categories.found = categories.length;

    // First pass - create all categories without parents
    for (const cat of categories) {
        const termId = extractCDATA(cat['wp:term_id']);
        const slug = extractCDATA(cat['wp:category_nicename']);
        const name = extractCDATA(cat['wp:cat_name']);
        const description = extractCDATA(cat['wp:category_description']) || '';

        // Check if exists
        const [existing] = await db.execute('SELECT id FROM categories WHERE slug = ?', [slug]);

        if (existing.length > 0) {
            categoryMapping[slug] = existing[0].id;
            console.log(`  Exists: ${name} (${slug}) -> ID ${existing[0].id}`);
        } else {
            const [result] = await db.execute(
                `INSERT INTO categories (name, name_fr, slug, description, status)
                 VALUES (?, ?, ?, ?, 'active')`,
                [name, name, slug, description]
            );
            categoryMapping[slug] = result.insertId;
            stats.categories.created++;
            console.log(`  Created: ${name} (${slug}) -> ID ${result.insertId}`);
        }
    }

    // Second pass - update parent relationships
    for (const cat of categories) {
        const slug = extractCDATA(cat['wp:category_nicename']);
        const parentSlug = extractCDATA(cat['wp:category_parent']);

        if (parentSlug && categoryMapping[parentSlug]) {
            await db.execute(
                'UPDATE categories SET parent_id = ? WHERE slug = ?',
                [categoryMapping[parentSlug], slug]
            );
        }
    }

    // ==========================================
    // 3. PROCESS ATTACHMENTS (for featured images)
    // ==========================================
    console.log('\n--- Processing Attachments ---');
    let items = channel.item;
    if (!Array.isArray(items)) items = items ? [items] : [];

    for (const item of items) {
        const postType = extractCDATA(item['wp:post_type']);
        if (postType === 'attachment') {
            const postId = extractCDATA(item['wp:post_id']);
            const attachmentUrl = extractCDATA(item['wp:attachment_url']);
            if (postId && attachmentUrl) {
                attachmentMapping[postId] = attachmentUrl;
            }
        }
    }
    console.log(`  Found ${Object.keys(attachmentMapping).length} attachments`);

    // ==========================================
    // 4. IMPORT POSTS
    // ==========================================
    console.log('\n--- Importing Posts ---');

    // Get default author
    const [defaultAuthor] = await db.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    const defaultAuthorId = defaultAuthor.length > 0 ? defaultAuthor[0].id : 1;

    let postCount = 0;
    for (const item of items) {
        const postType = extractCDATA(item['wp:post_type']);
        const status = extractCDATA(item['wp:status']);

        // Only import published posts
        if (postType !== 'post' || status !== 'publish') {
            continue;
        }

        stats.posts.found++;
        postCount++;

        const title = extractCDATA(item.title);
        let slug = extractCDATA(item['wp:post_name']);
        const content = cleanContent(extractCDATA(item['content:encoded']));
        const excerpt = extractCDATA(item['excerpt:encoded']) || '';
        const postDate = extractCDATA(item['wp:post_date']);
        const creator = extractCDATA(item['dc:creator']);

        // Skip posts without title or content
        if (!title || title.trim() === '') {
            stats.posts.skipped++;
            continue;
        }

        // Generate slug if empty
        if (!slug || slug.trim() === '') {
            slug = generateSlug(title);
        }

        // Get author ID
        let authorId = defaultAuthorId;
        for (const [wpId, dbId] of Object.entries(authorMapping)) {
            const [author] = await db.execute('SELECT id FROM users WHERE id = ? AND username LIKE ?', [dbId, `%${creator.replace(/[^a-zA-Z0-9]/g, '')}%`]);
            if (author.length > 0) {
                authorId = author[0].id;
                break;
            }
        }
        // Fallback: find by creator name
        if (authorId === defaultAuthorId) {
            const creatorClean = creator.replace(/[^a-zA-Z0-9]/g, '');
            const [authorByName] = await db.execute('SELECT id FROM users WHERE username LIKE ?', [`%${creatorClean}%`]);
            if (authorByName.length > 0) {
                authorId = authorByName[0].id;
            }
        }

        // Get categories
        let postCategories = item.category;
        if (!Array.isArray(postCategories)) postCategories = postCategories ? [postCategories] : [];

        const categoryIds = [];
        for (const cat of postCategories) {
            const catSlug = cat.$ ? cat.$.nicename : null;
            if (catSlug && categoryMapping[catSlug]) {
                categoryIds.push(categoryMapping[catSlug]);
            }
        }

        // Get featured image
        let featuredImage = '';
        const postMetas = item['wp:postmeta'];
        if (postMetas) {
            const metas = Array.isArray(postMetas) ? postMetas : [postMetas];
            for (const meta of metas) {
                const key = extractCDATA(meta['wp:meta_key']);
                const value = extractCDATA(meta['wp:meta_value']);
                if (key === '_thumbnail_id' && attachmentMapping[value]) {
                    const imgUrl = attachmentMapping[value];
                    try {
                        const downloaded = await downloadImage(imgUrl, uploadsFolder);
                        featuredImage = downloaded.url;
                        stats.images.downloaded++;
                    } catch (e) {
                        stats.images.failed++;
                        // Use original URL as fallback
                        featuredImage = imgUrl;
                    }
                }
            }
        }

        // Check if post exists by slug
        const [existing] = await db.execute('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            console.log(`  Skipped (exists): ${title.substring(0, 50)}...`);
            stats.posts.skipped++;
            continue;
        }

        // Make slug unique if needed
        let uniqueSlug = slug;
        let slugCounter = 1;
        while (true) {
            const [check] = await db.execute('SELECT id FROM posts WHERE slug = ?', [uniqueSlug]);
            if (check.length === 0) break;
            uniqueSlug = `${slug}-${slugCounter++}`;
        }

        // Insert post
        try {
            const [result] = await db.execute(
                `INSERT INTO posts (title, title_fr, slug, excerpt, excerpt_fr, content, content_fr,
                    featured_image, author_id, category_id, type, status, published_at, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'post', 'published', ?, ?)`,
                [
                    title, title, uniqueSlug, excerpt, excerpt, content, content,
                    featuredImage, authorId, categoryIds[0] || null,
                    postDate, postDate
                ]
            );

            // Insert post_categories relations
            for (const catId of categoryIds) {
                try {
                    await db.execute(
                        'INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)',
                        [result.insertId, catId]
                    );
                } catch (e) {
                    // Ignore duplicates
                }
            }

            stats.posts.created++;
            if (postCount % 50 === 0) {
                console.log(`  Imported ${postCount} posts...`);
            }
        } catch (e) {
            console.error(`  Error importing "${title}": ${e.message}`);
            stats.posts.skipped++;
        }
    }

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('\n========================================');
    console.log('IMPORT COMPLETE');
    console.log('========================================');
    console.log(`Authors:    ${stats.authors.created} created, ${stats.authors.mapped} mapped (${stats.authors.found} found)`);
    console.log(`Categories: ${stats.categories.created} created (${stats.categories.found} found)`);
    console.log(`Posts:      ${stats.posts.created} created, ${stats.posts.skipped} skipped (${stats.posts.found} found)`);
    console.log(`Images:     ${stats.images.downloaded} downloaded, ${stats.images.failed} failed`);
    console.log('========================================\n');

    await db.end();
    console.log('Database connection closed.');
}

// Run import
const xmlFile = process.argv[2];
if (!xmlFile) {
    console.error('Usage: node import-wordpress.js <wordpress-export.xml>');
    process.exit(1);
}

if (!fs.existsSync(xmlFile)) {
    console.error(`File not found: ${xmlFile}`);
    process.exit(1);
}

importWordPress(xmlFile).catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
});
