const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

const FRENCH_WORDS = ['le', 'la', 'les', 'du', 'des', 'au', 'aux', 'une', 'un', 'et', 'pour', 'dans', 'sur', 'avec', 'qui', 'que', 'est', 'sont', 'cette', 'ces'];
const ENGLISH_WORDS = ['the', 'is', 'are', 'was', 'were', 'has', 'have', 'for', 'with', 'from', 'that', 'this', 'will', 'can', 'not'];

function detectLanguage(text) {
  if (!text) return { language: 'unknown', confidence: 0 };
  const words = text.toLowerCase().split(/[^a-z\u00e0-\u00ff]+/).filter(Boolean);
  let fr = 0, en = 0;
  for (const w of words) {
    if (FRENCH_WORDS.includes(w)) fr++;
    if (ENGLISH_WORDS.includes(w)) en++;
  }
  const total = fr + en;
  if (total === 0) return { language: 'unknown', confidence: 0 };
  if (fr >= 2 && fr > en) return { language: 'fr', confidence: Math.round((fr / total) * 100) };
  if (en >= 2 && en > fr) return { language: 'en', confidence: Math.round((en / total) * 100) };
  return { language: 'unknown', confidence: 0 };
}

// GET /api/language-audit
router.get('/', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const [posts] = await db.query('SELECT id, title_fr, title_en, original_language FROM posts ORDER BY id DESC');
    const issues = [];
    for (const post of posts) {
      const det = detectLanguage(post.title_fr);
      if (det.language !== 'unknown' && det.language !== post.original_language) {
        issues.push({
          id: post.id, title_fr: post.title_fr, title_en: post.title_en,
          current_language: post.original_language || 'fr',
          detected_language: det.language, confidence: det.confidence
        });
      }
    }
    issues.sort((a, b) => b.confidence - a.confidence);
    res.json({ success: true, total_posts: posts.length, total_issues: issues.length, articles: issues });
  } catch (error) {
    console.error('Language audit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/language-audit/bulk-fix
router.put('/bulk-fix', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { fixes } = req.body;
    if (!Array.isArray(fixes) || fixes.length === 0) {
      return res.status(400).json({ success: false, message: 'No fixes provided' });
    }
    let updated = 0;
    for (const fix of fixes) {
      if (fix.id && ['fr', 'en'].includes(fix.new_language)) {
        const [r] = await db.query('UPDATE posts SET original_language = ? WHERE id = ?', [fix.new_language, fix.id]);
        if (r.affectedRows > 0) updated++;
      }
    }
    res.json({ success: true, updated, message: `${updated} article(s) mis à jour` });
  } catch (error) {
    console.error('Bulk fix error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
