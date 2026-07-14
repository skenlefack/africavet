/**
 * Sync WordPress posts into AfricaVET CMS (production)
 * Fetches posts from WP REST API published after the last synced date
 */

const mysql = require('mysql2/promise');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

const WP_API = 'https://www.africavet.com/wp-json/wp/v2';
const AFTER_DATE = '2026-06-10T16:01:59'; // Last synced post date
const PER_PAGE = 10;
const UPLOADS_DIR = path.join('/app', 'uploads', 'wordpress');

// Use require for db config (works inside Docker container)
let db;

let wpCategoryMap = {};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'AfricaVET-Importer/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const totalHeader = res.headers['x-wp-total'];
          const result = JSON.parse(data);
          resolve({ data: result, total: totalHeader ? parseInt(totalHeader) : null });
        } catch (e) {
          reject(new Error('JSON parse error: ' + e.message));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'AfricaVET-Importer/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
      }
      const ws = fs.createWriteStream(destPath);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve(destPath); });
      ws.on('error', reject);
    }).on('error', reject);
  });
}

async function loadWPCategories() {
  console.log('Loading WordPress categories...');
  const { data: cats } = await fetchJSON(WP_API + '/categories?per_page=100');
  for (const cat of cats) {
    wpCategoryMap[cat.id] = cat.slug;
  }
  console.log('  Loaded ' + Object.keys(wpCategoryMap).length + ' WP categories');
}

async function getLocalCategoryId(wpCatIds) {
  if (!wpCatIds || wpCatIds.length === 0) return 9;
  for (const wpId of wpCatIds) {
    const slug = wpCategoryMap[wpId];
    if (!slug || slug === 'uncategorized') continue;
    const [rows] = await db.query('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (rows.length > 0) return rows[0].id;
  }
  return 9; // fallback: news
}

function decodeHTML(html) {
  if (!html) return '';
  return html
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8230;/g, '\u2026')
    .replace(/&nbsp;/g, ' ')
    .replace(/<\/?[^>]+(>|$)/g, '');
}

function extractExcerpt(content, maxLen) {
  maxLen = maxLen || 200;
  const text = decodeHTML(content);
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '...';
}

async function downloadFeaturedImage(post) {
  if (!post.featured_media || post.featured_media === 0) return null;
  try {
    const { data: media } = await fetchJSON(WP_API + '/media/' + post.featured_media);
    const imageUrl = media.source_url;
    if (!imageUrl) return null;
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = slugify(post.slug, { lower: true, strict: true }).substring(0, 80) + ext;
    const destPath = path.join(UPLOADS_DIR, filename);
    const dbPath = '/uploads/wordpress/' + filename;
    if (fs.existsSync(destPath)) return dbPath;
    await downloadFile(imageUrl, destPath);
    console.log('    Image downloaded: ' + filename);
    return dbPath;
  } catch (err) {
    console.warn('  Warning: Could not download image for ' + post.slug + ': ' + err.message);
    return null;
  }
}

async function run() {
  // Setup uploads dir
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Connect to DB using environment variables (Docker container)
  db = await mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'africavet',
    password: process.env.DB_PASSWORD || 'devpassword',
    database: process.env.DB_NAME || 'africavet_cms',
    charset: 'utf8mb4'
  });
  console.log('Connected to database');

  await loadWPCategories();

  // Get existing slugs to avoid duplicates
  const [existingSlugs] = await db.query('SELECT slug FROM posts');
  const slugSet = new Set(existingSlugs.map(r => r.slug));
  console.log('Existing posts in DB: ' + slugSet.size);

  // Fetch total count
  const { total } = await fetchJSON(WP_API + '/posts?per_page=1&after=' + AFTER_DATE + '&status=publish');
  console.log('\nTotal WP posts after ' + AFTER_DATE + ': ' + total);

  if (!total || total === 0) {
    console.log('No new posts to import.');
    await db.end();
    process.exit(0);
  }

  const totalPages = Math.ceil(total / PER_PAGE);
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  let importedList = [];

  for (let page = 1; page <= totalPages; page++) {
    console.log('\n--- Page ' + page + '/' + totalPages + ' ---');
    const url = WP_API + '/posts?per_page=' + PER_PAGE + '&page=' + page + '&after=' + AFTER_DATE + '&status=publish&orderby=date&order=asc&_embed';

    let posts;
    try {
      const result = await fetchJSON(url);
      posts = result.data;
    } catch (err) {
      console.error('  Error fetching page ' + page + ': ' + err.message);
      errors++;
      continue;
    }

    if (!Array.isArray(posts)) {
      console.error('  Invalid response on page ' + page);
      errors++;
      continue;
    }

    for (const post of posts) {
      const slug = post.slug;

      if (slugSet.has(slug)) {
        console.log('  SKIP (exists): ' + slug.substring(0, 60));
        skipped++;
        continue;
      }

      try {
        const title = decodeHTML(post.title.rendered);
        const content = post.content.rendered || '';
        const excerpt = extractExcerpt(post.excerpt.rendered || content);
        const categoryId = await getLocalCategoryId(post.categories);
        const featuredImage = await downloadFeaturedImage(post);
        const publishedAt = post.date_gmt ? new Date(post.date_gmt + 'Z') : new Date();
        const mysqlDate = publishedAt.toISOString().slice(0, 19).replace('T', ' ');

        const [result] = await db.query(
          `INSERT INTO posts (title, title_fr, slug, content, content_fr, excerpt, excerpt_fr,
           featured_image, author_id, category_id, type, status, visibility, featured,
           allow_comments, published_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'post', 'published', 'public', 0, 1, ?, ?, NOW())`,
          [title, title, slug, content, content, excerpt, excerpt,
           featuredImage, categoryId, mysqlDate, mysqlDate]
        );

        // Add to post_categories junction table
        const newPostId = result.insertId;
        if (categoryId) {
          try {
            await db.query('INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)', [newPostId, categoryId]);
          } catch(e) { /* ignore if junction table missing or duplicate */ }
        }

        slugSet.add(slug);
        imported++;
        importedList.push({ title: title.substring(0, 80), date: mysqlDate });
        console.log('  OK #' + imported + ': ' + title.substring(0, 70));
      } catch (err) {
        console.error('  ERROR importing "' + slug + '": ' + err.message);
        errors++;
      }
    }
  }

  console.log('\n========================================');
  console.log('IMPORT COMPLETE!');
  console.log('  Imported: ' + imported);
  console.log('  Skipped (duplicates): ' + skipped);
  console.log('  Errors: ' + errors);
  console.log('========================================');

  if (importedList.length > 0) {
    console.log('\nImported articles:');
    importedList.forEach((p, i) => console.log('  ' + (i+1) + '. [' + p.date + '] ' + p.title));
  }

  await db.end();
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
