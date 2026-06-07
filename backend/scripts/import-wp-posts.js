/**
 * Import WordPress posts into AfricaVET CMS
 * Fetches posts from WP REST API published after the last synced date
 */

const mysql = require('mysql2/promise');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

const WP_API = 'https://www.africavet.com/wp-json/wp/v2';
const AFTER_DATE = '2026-02-13T16:53:05'; // Last synced post date
const PER_PAGE = 10;
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'wordpress');

// DB config from environment
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4'
};

// WP category ID -> local slug mapping (built dynamically)
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
          reject(new Error(`JSON parse error: ${e.message}`));
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
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
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
  const { data: cats } = await fetchJSON(`${WP_API}/categories?per_page=100`);
  for (const cat of cats) {
    wpCategoryMap[cat.id] = cat.slug;
  }
  console.log(`  Loaded ${Object.keys(wpCategoryMap).length} WP categories`);
}

async function getLocalCategoryId(db, wpCatIds) {
  if (!wpCatIds || wpCatIds.length === 0) return 9; // default: news

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
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/<\/?[^>]+(>|$)/g, ''); // strip HTML tags for excerpt
}

function extractExcerpt(content, maxLen = 200) {
  const text = decodeHTML(content);
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '...';
}

async function downloadFeaturedImage(post) {
  // Try to get featured media
  if (!post.featured_media || post.featured_media === 0) return null;

  try {
    const { data: media } = await fetchJSON(`${WP_API}/media/${post.featured_media}`);
    const imageUrl = media.source_url;
    if (!imageUrl) return null;

    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = slugify(post.slug, { lower: true, strict: true }).substring(0, 80) + ext;
    const destPath = path.join(UPLOADS_DIR, filename);
    const dbPath = `/uploads/wordpress/${filename}`;

    // Skip if already downloaded
    if (fs.existsSync(destPath)) {
      return dbPath;
    }

    await downloadFile(imageUrl, destPath);
    return dbPath;
  } catch (err) {
    console.warn(`  Warning: Could not download image for "${post.slug}": ${err.message}`);
    return null;
  }
}

async function run() {
  // Ensure uploads dir exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const db = await mysql.createConnection(dbConfig);
  console.log('Connected to database');

  await loadWPCategories();

  // Get existing slugs to avoid duplicates
  const [existingSlugs] = await db.query('SELECT slug FROM posts');
  const slugSet = new Set(existingSlugs.map(r => r.slug));
  console.log(`Existing posts: ${slugSet.size}`);

  // Fetch total count
  const { total } = await fetchJSON(`${WP_API}/posts?per_page=1&after=${AFTER_DATE}&status=publish`);
  console.log(`\nTotal WP posts to import: ${total}`);

  const totalPages = Math.ceil(total / PER_PAGE);
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let page = 1; page <= totalPages; page++) {
    console.log(`\nPage ${page}/${totalPages}...`);
    const url = `${WP_API}/posts?per_page=${PER_PAGE}&page=${page}&after=${AFTER_DATE}&status=publish&orderby=date&order=asc&_embed`;

    let posts;
    try {
      const result = await fetchJSON(url);
      posts = result.data;
    } catch (err) {
      console.error(`  Error fetching page ${page}: ${err.message}`);
      errors++;
      continue;
    }

    for (const post of posts) {
      const slug = post.slug;

      // Skip duplicates
      if (slugSet.has(slug)) {
        skipped++;
        continue;
      }

      try {
        const title = decodeHTML(post.title.rendered);
        const content = post.content.rendered || '';
        const excerpt = extractExcerpt(post.excerpt.rendered || content);
        const categoryId = await getLocalCategoryId(db, post.categories);
        const featuredImage = await downloadFeaturedImage(post);
        const publishedAt = post.date_gmt ? new Date(post.date_gmt + 'Z') : new Date();

        await db.query(
          `INSERT INTO posts (title, title_fr, slug, content, content_fr, excerpt, excerpt_fr,
           featured_image, author_id, category_id, type, status, visibility, featured,
           allow_comments, published_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'post', 'published', 'public', 0, 1, ?, ?, NOW())`,
          [title, title, slug, content, content, excerpt, excerpt,
           featuredImage, categoryId, publishedAt, publishedAt]
        );

        slugSet.add(slug);
        imported++;
        console.log(`  ✓ ${imported}: ${title.substring(0, 70)}...`);
      } catch (err) {
        console.error(`  ✗ Error importing "${slug}": ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`Import complete!`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped (duplicates): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`========================================`);

  await db.end();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
