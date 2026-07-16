/**
 * RSS Feed Routes
 * Public RSS 2.0 feeds for articles and opportunities
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

const SITE_URL = 'https://www.africavet.com';
const SITE_NAME = 'AfricaVET';

function escapeXml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function toRfc822(date) {
  return new Date(date).toUTCString();
}

/**
 * GET /api/feed/articles.xml
 * RSS feed of latest published articles
 */
router.get('/articles.xml', async (req, res) => {
  try {
    const { category, limit = 30 } = req.query;

    let query = `
      SELECT p.id, p.title_fr, p.title_en, p.slug, p.excerpt_fr, p.excerpt_en,
             p.featured_image, p.published_at, p.type, p.country,
             u.first_name as author_first, u.last_name as author_last
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = 'published'
    `;
    const params = [];

    if (category) {
      query += ` AND EXISTS (
        SELECT 1 FROM post_categories pc
        INNER JOIN categories c ON pc.category_id = c.id
        WHERE pc.post_id = p.id AND c.slug = ?
      )`;
      params.push(category);
    }

    query += ' ORDER BY p.published_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [posts] = await db.query(query, params);

    const items = posts.map(p => {
      const title = escapeXml(p.title_fr || p.title_en || '');
      const description = escapeXml(p.excerpt_fr || p.excerpt_en || '');
      const link = `${SITE_URL}/fr/news/${p.slug}`;
      const author = [p.author_first, p.author_last].filter(Boolean).join(' ');
      const pubDate = p.published_at ? toRfc822(p.published_at) : '';
      const image = p.featured_image ? `${SITE_URL}${p.featured_image}` : '';

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      ${author ? `<author>${escapeXml(author)}</author>` : ''}
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      <guid isPermaLink="true">${link}</guid>
      ${p.country ? `<category>${escapeXml(p.country)}</category>` : ''}
      ${image ? `<enclosure url="${image}" type="image/jpeg" />` : ''}
    </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} - Articles</title>
    <link>${SITE_URL}</link>
    <description>Actualités, analyses et ressources sur la santé animale et la médecine vétérinaire en Afrique</description>
    <language>fr</language>
    <lastBuildDate>${toRfc822(new Date())}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/feed/articles.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/images/africavet-logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  } catch (error) {
    console.error('RSS articles error:', error);
    res.status(500).send('Error generating feed');
  }
});

/**
 * GET /api/feed/opportunities.xml
 * RSS feed of latest open opportunities
 */
router.get('/opportunities.xml', async (req, res) => {
  try {
    const { type, country, limit = 30 } = req.query;

    let query = `
      SELECT id, title_fr, title_en, opportunity_type, organization_name, country, city,
             deadline, slug, created_at, description_fr
      FROM opportunities
      WHERE status = 'published' AND (deadline IS NULL OR deadline > NOW())
    `;
    const params = [];

    if (type) { query += ' AND opportunity_type = ?'; params.push(type); }
    if (country) { query += ' AND country = ?'; params.push(country); }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [opps] = await db.query(query, params);

    const items = opps.map(o => {
      const title = escapeXml(o.title_fr || o.title_en || '');
      const typeLabel = o.opportunity_type === 'job' ? 'Emploi' : o.opportunity_type === 'tender' ? 'Appel d\'offres' : 'Marché';
      const link = `${SITE_URL}/fr/opportunities/${o.id}`;
      const desc = escapeXml(
        `[${typeLabel}] ${o.organization_name || ''} — ${o.country || ''}${o.deadline ? ` | Date limite: ${new Date(o.deadline).toLocaleDateString('fr-FR')}` : ''}`
      );

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${desc}</description>
      <category>${escapeXml(typeLabel)}</category>
      ${o.country ? `<category>${escapeXml(o.country)}</category>` : ''}
      <pubDate>${toRfc822(o.created_at)}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} - Opportunités</title>
    <link>${SITE_URL}/fr/opportunities</link>
    <description>Emplois, appels d'offres et marchés vétérinaires en Afrique</description>
    <language>fr</language>
    <lastBuildDate>${toRfc822(new Date())}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/feed/opportunities.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  } catch (error) {
    console.error('RSS opportunities error:', error);
    res.status(500).send('Error generating feed');
  }
});

module.exports = router;
