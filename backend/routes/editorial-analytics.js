const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// GET /api/editorial-analytics/kpi — Main KPI endpoint
router.get('/kpi', auth, authorize('editor', 'admin'), async (req, res) => {
  try {
    // Total articles
    const [[{ total_articles }]] = await db.query('SELECT COUNT(*) as total_articles FROM posts WHERE status = ?', ['published']);

    // Total views
    const [[{ total_views }]] = await db.query('SELECT COALESCE(SUM(views_count), 0) as total_views FROM posts WHERE status = ?', ['published']);

    // Countries covered
    const [countryRows] = await db.query(
      `SELECT DISTINCT country FROM posts WHERE status = 'published' AND country IS NOT NULL AND country != ''`
    );
    const countries_covered = countryRows.length;

    // Country field filled rate
    const [[{ country_filled }]] = await db.query(
      `SELECT COUNT(*) as country_filled FROM posts WHERE status = 'published' AND country IS NOT NULL AND country != ''`
    );

    // Meta title filled
    const [[{ meta_title_filled }]] = await db.query(
      `SELECT COUNT(*) as meta_title_filled FROM posts WHERE status = 'published' AND meta_title IS NOT NULL AND meta_title != ''`
    );

    // Meta description filled
    const [[{ meta_desc_filled }]] = await db.query(
      `SELECT COUNT(*) as meta_desc_filled FROM posts WHERE status = 'published' AND meta_description IS NOT NULL AND meta_description != ''`
    );

    // Image credit filled
    const [[{ image_credit_filled }]] = await db.query(
      `SELECT COUNT(*) as image_credit_filled FROM posts WHERE status = 'published' AND image_credit IS NOT NULL AND image_credit != ''`
    );

    // Sources filled
    const [[{ sources_filled }]] = await db.query(
      `SELECT COUNT(*) as sources_filled FROM posts WHERE status = 'published' AND sources IS NOT NULL AND sources != ''`
    );

    // Review traced
    const [[{ review_traced }]] = await db.query(
      `SELECT COUNT(*) as review_traced FROM posts WHERE status = 'published' AND reviewed_at IS NOT NULL`
    );

    // Author stats
    const [authorRows] = await db.query(
      `SELECT COALESCE(author, CONCAT(author_first, ' ', author_last)) as author_name, COUNT(*) as cnt
       FROM posts WHERE status = 'published'
       GROUP BY author_name ORDER BY cnt DESC`
    );
    const first_author_share = authorRows.length > 0 ? authorRows[0].cnt / total_articles : 0;

    // Active authors last 90 days
    const [activeAuthors] = await db.query(
      `SELECT DISTINCT COALESCE(author, CONCAT(author_first, ' ', author_last)) as author_name
       FROM posts WHERE status = 'published' AND published_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)`
    );

    // Articles this month
    const [[{ articles_this_month }]] = await db.query(
      `SELECT COUNT(*) as articles_this_month FROM posts
       WHERE status = 'published' AND YEAR(published_at) = YEAR(NOW()) AND MONTH(published_at) = MONTH(NOW())`
    );

    // Articles last 30 days
    const [[{ articles_last_30 }]] = await db.query(
      `SELECT COUNT(*) as articles_last_30 FROM posts
       WHERE status = 'published' AND published_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    // Title length analysis (45-80 chars)
    const [[{ titles_good_length }]] = await db.query(
      `SELECT COUNT(*) as titles_good_length FROM posts
       WHERE status = 'published' AND CHAR_LENGTH(COALESCE(title_fr, '')) BETWEEN 45 AND 80`
    );

    // Articles >= 500 words
    const [[{ articles_500w }]] = await db.query(
      `SELECT COUNT(*) as articles_500w FROM posts
       WHERE status = 'published' AND (
         LENGTH(COALESCE(content_fr, '')) - LENGTH(REPLACE(COALESCE(content_fr, ''), ' ', '')) + 1 >= 500
         OR LENGTH(COALESCE(content_en, '')) - LENGTH(REPLACE(COALESCE(content_en, ''), ' ', '')) + 1 >= 500
       )`
    );

    const safe = (n, d) => d > 0 ? Math.round((n / d) * 10000) / 10000 : 0;

    const kpis = {
      countries_covered: { value: countries_covered, target_j90: 55, unit: 'pays' },
      countries_without_article: { value: Math.max(0, 55 - countries_covered), target_j90: 0, unit: 'pays' },
      first_author_share: { value: Math.round(first_author_share * 1000) / 1000, target_j90: 0.72, unit: '%' },
      active_authors_90d: { value: activeAuthors.length, target_j90: 4, unit: 'auteurs' },
      country_field_filled: { value: safe(country_filled, total_articles), target_j90: 0.25, unit: '%' },
      meta_title_filled: { value: safe(meta_title_filled, total_articles), target_j90: 0.35, unit: '%' },
      meta_description_filled: { value: safe(meta_desc_filled, total_articles), target_j90: 0.35, unit: '%' },
      image_credit_filled: { value: safe(image_credit_filled, total_articles), target_j90: 0.25, unit: '%' },
      sources_filled: { value: safe(sources_filled, total_articles), target_j90: 0.25, unit: '%' },
      review_traced: { value: safe(review_traced, total_articles), target_j90: 0.25, unit: '%' },
      articles_500_words: { value: safe(articles_500w, total_articles), target_j90: 0.55, unit: '%' },
      titles_45_80_chars: { value: safe(titles_good_length, total_articles), target_j90: 0.55, unit: '%' },
      total_articles: { value: total_articles, unit: 'articles' },
      total_views: { value: total_views, unit: 'vues' },
      avg_views_per_article: { value: total_articles > 0 ? Math.round(total_views / total_articles * 10) / 10 : 0, unit: 'vues' },
      articles_this_month: { value: articles_this_month, unit: 'articles' },
      articles_last_30_days: { value: articles_last_30, unit: 'articles' },
    };

    // Top countries
    const [topCountries] = await db.query(
      `SELECT country, COUNT(*) as count FROM posts
       WHERE status = 'published' AND country IS NOT NULL AND country != ''
       GROUP BY country ORDER BY count DESC LIMIT 15`
    );

    // Top authors
    const topAuthors = authorRows.slice(0, 10).map(a => ({
      name: a.author_name,
      articles: a.cnt,
      share: safe(a.cnt, total_articles)
    }));

    // Monthly production
    const [monthlyProd] = await db.query(
      `SELECT DATE_FORMAT(published_at, '%Y-%m') as month, COUNT(*) as articles,
              COALESCE(SUM(views_count), 0) as views
       FROM posts WHERE status = 'published' AND published_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month ASC`
    );

    // Region distribution
    const [regions] = await db.query(
      `SELECT region, COUNT(*) as count FROM posts
       WHERE status = 'published' AND region IS NOT NULL AND region != ''
       GROUP BY region ORDER BY count DESC`
    );

    res.json({
      success: true,
      data: {
        computed_at: new Date().toISOString(),
        kpis,
        top_countries: topCountries,
        top_authors: topAuthors,
        monthly_production: monthlyProd,
        regions_distribution: regions
      }
    });
  } catch (error) {
    console.error('Error computing editorial KPIs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/editorial-analytics/export — CSV export
router.get('/export', auth, authorize('admin'), async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT id, title_fr, COALESCE(author, CONCAT(author_first, ' ', author_last)) as author_name,
              country, region, original_language, status, published_at, views_count,
              CASE WHEN meta_title IS NOT NULL AND meta_title != '' THEN 'Oui' ELSE 'Non' END as has_meta_title,
              CASE WHEN meta_description IS NOT NULL AND meta_description != '' THEN 'Oui' ELSE 'Non' END as has_meta_desc,
              CASE WHEN sources IS NOT NULL AND sources != '' THEN 'Oui' ELSE 'Non' END as has_sources,
              CASE WHEN image_credit IS NOT NULL AND image_credit != '' THEN 'Oui' ELSE 'Non' END as has_image_credit,
              CASE WHEN reviewed_at IS NOT NULL THEN 'Oui' ELSE 'Non' END as has_review
       FROM posts WHERE status = 'published' ORDER BY published_at DESC`
    );

    const headers = 'ID,Titre,Auteur,Pays,Région,Langue,Statut,Date publication,Vues,Méta-titre,Méta-desc,Sources,Crédit image,Relecture\n';
    const csv = headers + posts.map(p =>
      [p.id, `"${(p.title_fr || '').replace(/"/g, '""')}"`, `"${p.author_name || ''}"`,
       p.country || '', p.region || '', p.original_language || '', p.status,
       p.published_at ? new Date(p.published_at).toISOString().split('T')[0] : '',
       p.views_count || 0, p.has_meta_title, p.has_meta_desc, p.has_sources, p.has_image_credit, p.has_review
      ].join(',')
    ).join('\n');

    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename=africavet-editorial-kpi-${new Date().toISOString().split('T')[0]}.csv`);
    res.send('\ufeff' + csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
