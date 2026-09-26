const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// Multer config for avatars
const uploadsDir = path.join(__dirname, '../uploads/authors');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `author-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/authors — List all authors
router.get('/', async (req, res) => {
  try {
    const { active, search } = req.query;
    let query = 'SELECT * FROM authors';
    const conditions = [];
    const params = [];

    if (active !== undefined) {
      conditions.push('is_active = ?');
      params.push(active === '1' ? 1 : 0);
    }
    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY name ASC';

    const [authors] = await db.query(query, params);
    res.json({ success: true, data: authors });
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/authors/:id — Get one author
router.get('/:id', async (req, res) => {
  try {
    const [authors] = await db.query('SELECT * FROM authors WHERE id = ?', [req.params.id]);
    if (authors.length === 0) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }
    res.json({ success: true, data: authors[0] });
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/authors — Create author (admin only)
router.post('/', auth, authorize('admin'), upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, bio_fr, bio_en, role, specialties, social_links } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const name_normalized = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const avatar = req.file ? `/uploads/authors/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO authors (name, name_normalized, email, bio_fr, bio_en, avatar, role, specialties, social_links)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, name_normalized, email || null,
        bio_fr || null, bio_en || null, avatar,
        role || 'auteur',
        specialties ? (typeof specialties === 'string' ? specialties : JSON.stringify(specialties)) : null,
        social_links ? (typeof social_links === 'string' ? social_links : JSON.stringify(social_links)) : null
      ]
    );

    res.status(201).json({ success: true, data: { id: result.insertId }, message: 'Author created' });
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/authors/:id — Update author
router.put('/:id', auth, authorize('admin'), upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, bio_fr, bio_en, role, specialties, social_links, is_active } = req.body;
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?', 'name_normalized = ?');
      values.push(name, name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
    if (email !== undefined) { updates.push('email = ?'); values.push(email || null); }
    if (bio_fr !== undefined) { updates.push('bio_fr = ?'); values.push(bio_fr || null); }
    if (bio_en !== undefined) { updates.push('bio_en = ?'); values.push(bio_en || null); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }
    if (specialties !== undefined) {
      updates.push('specialties = ?');
      values.push(typeof specialties === 'string' ? specialties : JSON.stringify(specialties));
    }
    if (social_links !== undefined) {
      updates.push('social_links = ?');
      values.push(typeof social_links === 'string' ? social_links : JSON.stringify(social_links));
    }
    if (req.file) {
      updates.push('avatar = ?');
      values.push(`/uploads/authors/${req.file.filename}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await db.query(`UPDATE authors SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Author updated' });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/authors/:id — Soft delete
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE authors SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Author deactivated' });
  } catch (error) {
    console.error('Error deleting author:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/authors/:id/articles — Get articles by author
router.get('/:id/articles', async (req, res) => {
  try {
    const [authors] = await db.query('SELECT name FROM authors WHERE id = ?', [req.params.id]);
    if (authors.length === 0) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }

    const authorName = authors[0].name;
    const [articles] = await db.query(
      `SELECT id, title_fr, title_en, slug, status, published_at, views_count
       FROM posts WHERE author = ? OR CONCAT(author_first, ' ', author_last) = ?
       ORDER BY published_at DESC LIMIT 50`,
      [authorName, authorName]
    );

    res.json({ success: true, data: articles });
  } catch (error) {
    console.error('Error fetching author articles:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
