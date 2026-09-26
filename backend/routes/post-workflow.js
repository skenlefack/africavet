const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// POST /api/post-workflow/:id/submit — Submit for review
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const [posts] = await db.query('SELECT id, status, workflow_status FROM posts WHERE id = ?', [req.params.id]);
    if (posts.length === 0) return res.status(404).json({ success: false, message: 'Post not found' });

    await db.query('UPDATE posts SET workflow_status = ? WHERE id = ?', ['submitted', req.params.id]);

    await db.query(
      `INSERT INTO post_reviews (post_id, reviewer_id, step, previous_step, status, notes)
       VALUES (?, ?, 'submitted', ?, 'pending', ?)`,
      [req.params.id, req.user.id, posts[0].workflow_status || 'draft', req.body.notes || null]
    );

    res.json({ success: true, message: 'Post submitted for review' });
  } catch (error) {
    console.error('Error submitting post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/post-workflow/:id/review — Submit a review
router.post('/:id/review', auth, authorize('editor', 'admin'), async (req, res) => {
  try {
    const { step, status, notes, checklist_data, validation_level } = req.body;

    if (!step || !status) {
      return res.status(400).json({ success: false, message: 'step and status are required' });
    }

    const [posts] = await db.query('SELECT workflow_status FROM posts WHERE id = ?', [req.params.id]);
    if (posts.length === 0) return res.status(404).json({ success: false, message: 'Post not found' });

    await db.query(
      `INSERT INTO post_reviews (post_id, reviewer_id, step, previous_step, status, notes, checklist_data, validation_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.params.id, req.user.id, step, posts[0].workflow_status || 'draft',
        status, notes || null,
        checklist_data ? JSON.stringify(checklist_data) : null,
        validation_level || 'N1'
      ]
    );

    // Update workflow status
    const newStatus = status === 'approved' ? step : (status === 'rejected' ? 'revision_requested' : 'in_review');
    await db.query('UPDATE posts SET workflow_status = ? WHERE id = ?', [newStatus, req.params.id]);

    res.json({ success: true, message: 'Review submitted' });
  } catch (error) {
    console.error('Error reviewing post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/post-workflow/:id/reviews — Review history
router.get('/:id/reviews', auth, async (req, res) => {
  try {
    const [reviews] = await db.query(
      `SELECT pr.*, u.username as reviewer_name
       FROM post_reviews pr
       LEFT JOIN users u ON pr.reviewer_id = u.id
       WHERE pr.post_id = ?
       ORDER BY pr.created_at DESC`,
      [req.params.id]
    );

    const [posts] = await db.query('SELECT id, title_fr, workflow_status FROM posts WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      data: {
        post: posts[0] || null,
        reviews,
        current_status: posts[0]?.workflow_status || 'draft'
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/post-workflow/pending — Posts pending review
router.get('/', auth, authorize('editor', 'admin'), async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT p.id, p.title_fr, p.title_en, p.workflow_status, p.status, p.created_at, p.updated_at,
              u.username as author_name,
              (SELECT COUNT(*) FROM post_reviews WHERE post_id = p.id) as review_count
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.workflow_status IN ('submitted', 'in_review')
       ORDER BY p.updated_at DESC`
    );

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching pending posts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/post-workflow/:id/approve — Final approval
router.post('/:id/approve', auth, authorize('editor', 'admin'), async (req, res) => {
  try {
    await db.query(
      'UPDATE posts SET workflow_status = ?, reviewer_id = ?, reviewed_at = NOW(), review_notes = ? WHERE id = ?',
      ['approved', req.user.id, req.body.notes || null, req.params.id]
    );

    await db.query(
      `INSERT INTO post_reviews (post_id, reviewer_id, step, status, notes, validation_level)
       VALUES (?, ?, 'approved', 'approved', ?, ?)`,
      [req.params.id, req.user.id, req.body.notes || 'Approved', req.body.validation_level || 'N1']
    );

    res.json({ success: true, message: 'Post approved' });
  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/post-workflow/:id/reject — Reject
router.post('/:id/reject', auth, authorize('editor', 'admin'), async (req, res) => {
  try {
    if (!req.body.notes) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    await db.query(
      'UPDATE posts SET workflow_status = ?, review_notes = ? WHERE id = ?',
      ['rejected', req.body.notes, req.params.id]
    );

    await db.query(
      `INSERT INTO post_reviews (post_id, reviewer_id, step, status, notes, validation_level)
       VALUES (?, ?, 'rejected', 'rejected', ?, ?)`,
      [req.params.id, req.user.id, req.body.notes, req.body.validation_level || 'N1']
    );

    res.json({ success: true, message: 'Post rejected' });
  } catch (error) {
    console.error('Error rejecting post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
