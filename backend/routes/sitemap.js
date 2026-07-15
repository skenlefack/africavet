const express = require('express');
const router = express.Router();
const db = require('../config/db');

const SITE_URL = 'https://www.africavet.com';

const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';

// Sitemap Index
router.get('/sitemap.xml', async (req, res) => {
  const now = new Date().toISOString();
  let xml = xmlHeader +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const sitemaps = ['sitemap-pages.xml', 'sitemap-articles.xml', 'sitemap-categories.xml', 'sitemap-opportunities.xml'];
  for (const s of sitemaps) {
    xml += `  <sitemap>\n    <loc>${SITE_URL}/${s}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>\n`;
  }
  xml += '</sitemapindex>';

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// Static pages
router.get('/sitemap-pages.xml', (req, res) => {
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
    { url: '/contact', priority: '0.5', changefreq: 'monthly' },
    { url: '/categories', priority: '0.7', changefreq: 'weekly' },
    { url: '/opportunites', priority: '0.8', changefreq: 'daily' },
    { url: '/alertes-veterinaires', priority: '0.7', changefreq: 'daily' },
    { url: '/conditions', priority: '0.3', changefreq: 'yearly' },
    { url: '/confidentialite', priority: '0.3', changefreq: 'yearly' },
    { url: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
  ];

  let xml = xmlHeader +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const p of pages) {
    xml += `  <url>\n    <loc>${SITE_URL}${p.url}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
  }
  xml += '</urlset>';

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// Articles sitemap
router.get('/sitemap-articles.xml', async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT slug, updated_at, published_at, featured_image
       FROM posts WHERE status = 'published'
       ORDER BY published_at DESC LIMIT 5000`
    );

    let xml = xmlHeader +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
      '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    for (const post of posts) {
      const lastmod = (post.updated_at || post.published_at || new Date()).toISOString();
      xml += `  <url>\n    <loc>${SITE_URL}/article/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n`;
      if (post.featured_image) {
        const imgUrl = post.featured_image.startsWith('http') ? post.featured_image : `${SITE_URL}${post.featured_image}`;
        xml += `    <image:image>\n      <image:loc>${imgUrl}</image:loc>\n    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }
    xml += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap articles error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Categories sitemap
router.get('/sitemap-categories.xml', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT slug FROM categories ORDER BY id');

    let xml = xmlHeader +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const cat of categories) {
      xml += `  <url>\n    <loc>${SITE_URL}/categorie/${cat.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
    xml += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap categories error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Opportunities sitemap
router.get('/sitemap-opportunities.xml', async (req, res) => {
  try {
    const [opps] = await db.query(
      `SELECT id, slug, updated_at, created_at
       FROM opportunities WHERE status = 'published'
       ORDER BY created_at DESC LIMIT 5000`
    );

    let xml = xmlHeader +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const opp of opps) {
      const lastmod = (opp.updated_at || opp.created_at || new Date()).toISOString();
      const url = opp.slug ? `/opportunites/${opp.slug}` : `/opportunites/${opp.id}`;
      xml += `  <url>\n    <loc>${SITE_URL}${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
    xml += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap opportunities error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// robots.txt
router.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /manager/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  res.set('Content-Type', 'text/plain');
  res.send(robots);
});

module.exports = router;
