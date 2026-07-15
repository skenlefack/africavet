/**
 * Update post authors based on WordPress XML export mapping
 * Maps WP author usernames to local user IDs
 */

const db = require('./config/db');
const fs = require('fs');

async function run() {
  // Load WP slug->author mapping
  const mapping = JSON.parse(fs.readFileSync('/app/wp-author-mapping.json', 'utf8'));
  console.log(`Loaded ${Object.keys(mapping).length} slug->author mappings from XML`);

  // Get local users
  const [users] = await db.query('SELECT id, username FROM users');
  const userMap = {};
  users.forEach(u => { userMap[u.username] = u.id; });
  console.log('Local users:', JSON.stringify(userMap));

  // For posts imported after the XML export (Feb 13), default author is malick.kane (id 3)
  // since he's the primary content creator
  const defaultAuthorForRecent = userMap['malick.kane'] || 3;

  // Update posts from XML mapping
  const [posts] = await db.query(
    'SELECT id, slug, author_id FROM posts WHERE author_id = 1'
  );
  console.log(`\nPosts with author_id=1 (Admin): ${posts.length}`);

  let updated = 0;
  let defaulted = 0;
  let unchanged = 0;

  for (const post of posts) {
    const wpAuthor = mapping[post.slug];
    let newAuthorId = null;

    if (wpAuthor && userMap[wpAuthor]) {
      newAuthorId = userMap[wpAuthor];
    } else {
      // Post not in XML (imported after Feb 13 via API) - use default
      newAuthorId = defaultAuthorForRecent;
      defaulted++;
    }

    if (newAuthorId && newAuthorId !== 1) {
      await db.query('UPDATE posts SET author_id = ? WHERE id = ?', [newAuthorId, post.id]);
      updated++;
    } else {
      unchanged++;
    }
  }

  // Show stats per author
  const [stats] = await db.query(
    `SELECT u.username, u.first_name, u.last_name, COUNT(p.id) as count
     FROM posts p JOIN users u ON p.author_id = u.id
     GROUP BY p.author_id ORDER BY count DESC`
  );
  console.log('\nFinal author distribution:');
  stats.forEach(s => console.log(`  ${s.first_name} ${s.last_name} (${s.username}): ${s.count} articles`));

  console.log(`\n========================================`);
  console.log(`Authors updated: ${updated}`);
  console.log(`Defaulted to malick.kane: ${defaulted}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`========================================`);

  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
