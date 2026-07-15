/**
 * Prerender middleware for SEO
 * Serves meta-enriched HTML to search engine crawlers
 * For regular users, requests pass through to the frontend SPA
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');

const SITE_URL = 'https://www.africavet.com';
const SITE_NAME = 'AfricaVET';
const DEFAULT_DESC = 'Le portail panafricain de la santé animale et de la médecine vétérinaire. Actualités, analyses, opportunités et ressources en Afrique.';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;

const BOT_USER_AGENTS = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|applebot/i;

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 300);
}

function buildMetaHtml({ title, description, image, url, type, jsonLd }) {
  const fullTitle = escapeHtml(title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Portail de la Médecine Vétérinaire en Afrique`);
  const desc = escapeHtml(description || DEFAULT_DESC);
  const img = image || DEFAULT_IMAGE;
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL;

  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${fullTitle}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="${type || 'website'}">
<meta property="og:image" content="${img}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@africavet">
<meta name="twitter:title" content="${fullTitle}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${img}">`;

  if (jsonLd) {
    html += `\n<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  }

  html += `
</head>
<body>
<h1>${fullTitle}</h1>
<p>${desc}</p>
</body>
</html>`;

  return html;
}

// Article page
router.get('/article/:slug', async (req, res, next) => {
  const ua = req.get('user-agent') || '';
  if (!BOT_USER_AGENTS.test(ua)) return next();

  try {
    const [posts] = await db.query(
      `SELECT p.*, u.first_name as author_first_name, u.last_name as author_last_name,
              c.name as category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.status = 'published'`,
      [req.params.slug]
    );

    if (posts.length === 0) return next();
    const post = posts[0];
    const authorName = post.author_first_name ? `${post.author_first_name} ${post.author_last_name || ''}`.trim() : SITE_NAME;
    const image = post.featured_image ? (post.featured_image.startsWith('http') ? post.featured_image : `${SITE_URL}${post.featured_image}`) : DEFAULT_IMAGE;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": post.title_fr || post.title,
      "description": stripHtml(post.excerpt_fr || post.excerpt || post.content_fr),
      "image": image,
      "datePublished": post.published_at || post.created_at,
      "dateModified": post.updated_at,
      "author": { "@type": "Person", "name": authorName },
      "publisher": { "@type": "Organization", "name": SITE_NAME, "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/article/${post.slug}` }
    };

    res.send(buildMetaHtml({
      title: post.title_fr || post.title,
      description: stripHtml(post.excerpt_fr || post.excerpt || post.content_fr),
      image,
      url: `/article/${post.slug}`,
      type: 'article',
      jsonLd
    }));
  } catch (error) {
    console.error('Prerender article error:', error);
    next();
  }
});

// Category page
router.get('/categorie/:slug', async (req, res, next) => {
  const ua = req.get('user-agent') || '';
  if (!BOT_USER_AGENTS.test(ua)) return next();

  try {
    const [cats] = await db.query('SELECT * FROM categories WHERE slug = ?', [req.params.slug]);
    if (cats.length === 0) return next();
    const cat = cats[0];

    res.send(buildMetaHtml({
      title: cat.name_fr || cat.name,
      description: `Retrouvez tous les articles AfricaVET dans la catégorie ${cat.name_fr || cat.name}. Actualités, analyses et ressources sur la santé animale en Afrique.`,
      url: `/categorie/${cat.slug}`
    }));
  } catch (error) {
    next();
  }
});

// Opportunities detail
router.get('/opportunites/:id', async (req, res, next) => {
  const ua = req.get('user-agent') || '';
  if (!BOT_USER_AGENTS.test(ua)) return next();

  try {
    const idOrSlug = req.params.id;
    const isId = /^\d+$/.test(idOrSlug);
    const [opps] = await db.query(
      `SELECT * FROM opportunities WHERE ${isId ? 'id' : 'slug'} = ? AND status = 'published'`,
      [idOrSlug]
    );
    if (opps.length === 0) return next();
    const opp = opps[0];
    const title = opp.title_fr || opp.title_en;

    const jsonLd = opp.opportunity_type === 'job' ? {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": title,
      "description": stripHtml(opp.description_fr || opp.description_en),
      "datePosted": opp.publication_date || opp.created_at,
      "validThrough": opp.deadline || undefined,
      "hiringOrganization": { "@type": "Organization", "name": opp.organization_name || "Non spécifié" },
      "jobLocation": opp.country ? { "@type": "Place", "address": { "@type": "PostalAddress", "addressCountry": opp.country } } : undefined
    } : null;

    res.send(buildMetaHtml({
      title,
      description: `${opp.organization_name ? opp.organization_name + ' - ' : ''}${title}. ${opp.country || ''}`,
      url: `/opportunites/${idOrSlug}`,
      jsonLd
    }));
  } catch (error) {
    next();
  }
});

// Homepage
router.get('/', async (req, res, next) => {
  const ua = req.get('user-agent') || '';
  if (!BOT_USER_AGENTS.test(ua)) return next();

  res.send(buildMetaHtml({
    title: null,
    description: DEFAULT_DESC,
    url: '/',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": SITE_NAME,
      "url": SITE_URL,
      "description": DEFAULT_DESC
    }
  }));
});

module.exports = router;
