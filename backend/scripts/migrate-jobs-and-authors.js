/**
 * Migration script:
 * 1. Move "Jobs" posts to opportunities module (type=job)
 * 2. Map real WordPress authors to imported posts
 */

const db = require('./config/db');
const slugify = require('slugify');

async function migrateJobsToOpportunities(connection) {
  console.log('\n=== TASK 1: Migrate Jobs posts to Opportunities ===\n');

  // Find all posts with "Jobs" in title
  const [jobPosts] = await connection.query(
    `SELECT id, title, title_fr, title_en, slug, content, content_fr, content_en,
            excerpt, excerpt_fr, excerpt_en, featured_image, published_at, status, author_id
     FROM posts
     WHERE (title LIKE '%Jobs%' OR title LIKE '%Job %' OR title LIKE '%Job –%' OR title LIKE 'Job:%')
       AND status != 'trash'
     ORDER BY published_at DESC`
  );

  console.log(`Found ${jobPosts.length} job posts to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (const post of jobPosts) {
    // Check if already exists in opportunities by slug
    const [existing] = await connection.query(
      'SELECT id FROM opportunities WHERE slug = ?', [post.slug]
    );
    if (existing.length > 0) {
      console.log(`  SKIP (exists): ${post.title.substring(0, 60)}`);
      skipped++;
      continue;
    }

    // Extract organization name from title if possible
    let orgName = '';
    const orgMatch = post.title.match(/Jobs?\s*[–\-:]\s*(.+?)(?:\s+(?:recrut|vacanc|seek|open|hire|recruit))/i);
    if (orgMatch) {
      orgName = orgMatch[1].trim();
    } else {
      const orgMatch2 = post.title.match(/Jobs?\s*[–\-:]\s*(.+)/i);
      if (orgMatch2) orgName = orgMatch2[1].substring(0, 100).trim();
    }

    const oppSlug = post.slug || slugify(post.title_fr || post.title, { lower: true, strict: true });

    await connection.query(
      `INSERT INTO opportunities
       (opportunity_type, title_fr, title_en, description_fr, description_en,
        organization_name, slug, status, publication_date, submitted_by,
        created_at, updated_at)
       VALUES ('job', ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, NOW())`,
      [
        post.title_fr || post.title,
        post.title_en || post.title,
        post.content_fr || post.content || '',
        post.content_en || post.content || '',
        orgName,
        oppSlug,
        post.published_at || new Date(),
        post.author_id || 1,
        post.published_at || new Date()
      ]
    );

    // Remove from post_categories then delete the post
    await connection.query('DELETE FROM post_categories WHERE post_id = ?', [post.id]);
    await connection.query('DELETE FROM post_tags WHERE post_id = ?', [post.id]);
    await connection.query('DELETE FROM posts WHERE id = ?', [post.id]);

    migrated++;
    console.log(`  OK #${migrated}: ${post.title.substring(0, 70)}`);
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`);
  return migrated;
}

async function mapAuthors(connection) {
  console.log('\n=== TASK 2: Map real WordPress authors to posts ===\n');

  // Author mapping from WordPress (WP author login -> local user id)
  // Based on the users in the database:
  // 3: malick.kane (Malick Kane) - redaction@africavet.com
  // 4: serge.kenlefack (Serge Kenlefack) - sergeoken@gmail.com
  // 6: flora.ingah (Flora J. Ingah) - contact@africavet.com
  // 7: simon.yaya (Simon Yaya) - info@africavet.com
  // 9: absan.bibou (Absan Bibou) - jacob.yacoubou@yahoo.fr

  // Get all users
  const [users] = await connection.query(
    'SELECT id, username, first_name, last_name FROM users WHERE role IN (?, ?, ?)',
    ['admin', 'editor', 'author']
  );
  console.log('Available authors:', users.map(u => `${u.id}:${u.first_name} ${u.last_name}`).join(', '));

  // Fetch author info from WordPress API for each post
  // Since we imported with author_id=1 for all, we need to use the WP XML export
  // The XML file has creator info per post. Let's use a different approach:
  // Fetch from WP REST API the posts and their author info

  const https = require('https');

  function fetchJSON(url) {
    return new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'AfricaVET-Importer/1.0' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(e); }
        });
        res.on('error', reject);
      }).on('error', reject);
    });
  }

  // First, load WP authors
  console.log('Loading WordPress authors...');
  const wpAuthors = await fetchJSON('https://www.africavet.com/wp-json/wp/v2/users?per_page=100');
  console.log(`Found ${wpAuthors.length} WP authors:`);

  // Build WP author ID -> name mapping
  const wpAuthorMap = {};
  for (const a of wpAuthors) {
    wpAuthorMap[a.id] = { name: a.name, slug: a.slug };
    console.log(`  WP#${a.id}: ${a.name} (${a.slug})`);
  }

  // Map WP author slug to local user ID
  const wpToLocal = {};
  for (const a of wpAuthors) {
    // Try to match by username
    const localUser = users.find(u =>
      u.username === a.slug ||
      u.username.includes(a.slug) ||
      a.slug.includes(u.username) ||
      (u.first_name + ' ' + u.last_name).toLowerCase() === a.name.toLowerCase() ||
      a.name.toLowerCase().includes(u.first_name.toLowerCase())
    );
    if (localUser) {
      wpToLocal[a.id] = localUser.id;
      console.log(`  Mapped WP "${a.name}" -> Local #${localUser.id} "${localUser.first_name} ${localUser.last_name}"`);
    }
  }

  // Now fetch posts from WP and update author_id in local DB
  console.log('\nUpdating post authors...');
  let updated = 0;
  let notFound = 0;
  let page = 1;
  const perPage = 100;

  while (true) {
    let wpPosts;
    try {
      wpPosts = await fetchJSON(`https://www.africavet.com/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&status=publish&orderby=date&order=asc`);
    } catch (e) {
      break;
    }

    if (!Array.isArray(wpPosts) || wpPosts.length === 0) break;

    for (const wp of wpPosts) {
      const localAuthorId = wpToLocal[wp.author];
      if (!localAuthorId || localAuthorId === 1) continue; // skip if no mapping or already admin

      // Find local post by slug
      const [localPosts] = await connection.query(
        'SELECT id, author_id FROM posts WHERE slug = ? AND author_id = 1',
        [wp.slug]
      );

      if (localPosts.length > 0) {
        await connection.query(
          'UPDATE posts SET author_id = ?, updated_at = NOW() WHERE id = ?',
          [localAuthorId, localPosts[0].id]
        );
        updated++;
        if (updated <= 10) {
          console.log(`  OK: "${wp.slug.substring(0, 50)}" -> author #${localAuthorId} (${wpAuthorMap[wp.author].name})`);
        }
      }
    }

    page++;
    if (wpPosts.length < perPage) break;
  }

  console.log(`\nAuthors updated: ${updated} posts`);
  return updated;
}

async function run() {
  const migrated = await migrateJobsToOpportunities(db);
  const authorsUpdated = await mapAuthors(db);

  console.log('\n========================================');
  console.log('ALL TASKS COMPLETE!');
  console.log(`  Jobs -> Opportunities: ${migrated}`);
  console.log(`  Authors updated: ${authorsUpdated}`);
  console.log('========================================');

  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
