const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'vet-alerts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for alert photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `alert-${uniqueId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).array('photos', 5);

// =====================================================
// PUBLIC ROUTES
// =====================================================

// GET all alerts (public, approved only)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'approved',
      type,
      priority,
      country,
      region,
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT a.*,
             u.username as reporter_username,
             (SELECT COUNT(*) FROM vet_alert_photos WHERE alert_id = a.id) as photo_count
      FROM vet_alerts a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.is_public = 1
    `;
    const params = [];

    // Only show approved alerts to public
    if (!req.user || req.user.role !== 'admin') {
      query += ' AND a.status = ?';
      params.push('approved');
    } else if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND a.alert_type = ?';
      params.push(type);
    }
    if (priority) {
      query += ' AND a.priority = ?';
      params.push(priority);
    }
    if (country) {
      query += ' AND a.country = ?';
      params.push(country);
    }
    if (region) {
      query += ' AND a.region = ?';
      params.push(region);
    }
    if (search) {
      query += ' AND (a.title_fr LIKE ? OR a.title_en LIKE ? OR a.disease_name LIKE ? OR a.description_fr LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Count total - use a separate count query
    let countQuery = `
      SELECT COUNT(*) as total
      FROM vet_alerts a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.is_public = 1
    `;
    const countParams = [];

    // Apply same filters for count
    if (!req.user || req.user.role !== 'admin') {
      countQuery += ' AND a.status = ?';
      countParams.push('approved');
    } else if (status && status !== 'all') {
      countQuery += ' AND a.status = ?';
      countParams.push(status);
    }
    if (type) {
      countQuery += ' AND a.alert_type = ?';
      countParams.push(type);
    }
    if (priority) {
      countQuery += ' AND a.priority = ?';
      countParams.push(priority);
    }
    if (country) {
      countQuery += ' AND a.country = ?';
      countParams.push(country);
    }
    if (region) {
      countQuery += ' AND a.region = ?';
      countParams.push(region);
    }
    if (search) {
      countQuery += ' AND (a.title_fr LIKE ? OR a.title_en LIKE ? OR a.disease_name LIKE ? OR a.description_fr LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const [[{ total }]] = await db.query(countQuery, countParams);

    // Add sorting and pagination
    const validSorts = ['created_at', 'priority', 'status', 'affected_count'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    query += ` ORDER BY a.${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [alerts] = await db.query(query, params);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single alert
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isCode = id.startsWith('ALERT-');

    const [alerts] = await db.query(`
      SELECT a.*,
             u.username as reporter_username,
             v.username as validator_username,
             r.username as resolver_username
      FROM vet_alerts a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN users v ON a.validated_by = v.id
      LEFT JOIN users r ON a.resolved_by = r.id
      WHERE ${isCode ? 'a.code = ?' : 'a.id = ?'}
    `, [id]);

    if (alerts.length === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const alert = alerts[0];

    // Only allow viewing approved alerts for non-admins
    if (alert.status !== 'approved' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get photos
    const [photos] = await db.query(
      'SELECT * FROM vet_alert_photos WHERE alert_id = ? ORDER BY display_order',
      [alert.id]
    );

    // Get history (admin only)
    let history = [];
    if (req.user && req.user.role === 'admin') {
      const [historyData] = await db.query(`
        SELECT h.*, u.username as performed_by_username
        FROM vet_alert_history h
        LEFT JOIN users u ON h.performed_by = u.id
        WHERE h.alert_id = ?
        ORDER BY h.created_at DESC
      `, [alert.id]);
      history = historyData;
    }

    // Increment view count
    await db.query('UPDATE vet_alerts SET views_count = views_count + 1 WHERE id = ?', [alert.id]);

    res.json({
      success: true,
      data: {
        ...alert,
        species: alert.species ? JSON.parse(alert.species) : [],
        photos,
        history
      }
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET alert statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [[totals]] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END) as investigating,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
        SUM(affected_count) as total_affected,
        SUM(dead_count) as total_deaths
      FROM vet_alerts
      WHERE status IN ('approved', 'investigating', 'resolved')
    `);

    const [byType] = await db.query(`
      SELECT alert_type, COUNT(*) as count
      FROM vet_alerts
      WHERE status IN ('approved', 'investigating', 'resolved')
      GROUP BY alert_type
    `);

    const [byRegion] = await db.query(`
      SELECT region, COUNT(*) as count
      FROM vet_alerts
      WHERE status IN ('approved', 'investigating', 'resolved') AND region IS NOT NULL
      GROUP BY region
      ORDER BY count DESC
      LIMIT 10
    `);

    const [recent] = await db.query(`
      SELECT id, code, title_fr, title_en, alert_type, priority, status, region, created_at
      FROM vet_alerts
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totals,
        byType: byType.reduce((acc, r) => ({ ...acc, [r.alert_type]: r.count }), {}),
        byRegion,
        recent
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// PUBLIC SUBMISSION
// =====================================================

// POST submit new alert (public or authenticated)
router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const {
        alert_type = 'disease_outbreak',
        title_fr,
        title_en,
        description_fr,
        description_en,
        country = 'Cameroun',
        region,
        city,
        location_details,
        latitude,
        longitude,
        species,
        disease_name,
        symptoms,
        affected_count,
        dead_count,
        suspected_cause,
        priority = 'medium',
        reporter_name,
        reporter_phone,
        reporter_email,
        reporter_organization,
        is_anonymous
      } = req.body;

      if (!title_fr) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }

      // Insert alert
      const [result] = await db.query(`
        INSERT INTO vet_alerts (
          alert_type, title_fr, title_en, description_fr, description_en,
          country, region, city, location_details, latitude, longitude,
          species, disease_name, symptoms, affected_count, dead_count, suspected_cause,
          priority, reporter_name, reporter_phone, reporter_email, reporter_organization,
          is_anonymous, user_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        alert_type, title_fr, title_en || null, description_fr || null, description_en || null,
        country, region || null, city || null, location_details || null,
        latitude || null, longitude || null,
        species ? JSON.stringify(Array.isArray(species) ? species : [species]) : null,
        disease_name || null, symptoms || null,
        parseInt(affected_count) || 0, parseInt(dead_count) || 0, suspected_cause || null,
        priority,
        reporter_name || null, reporter_phone || null, reporter_email || null, reporter_organization || null,
        is_anonymous === 'true' || is_anonymous === true ? 1 : 0,
        req.user ? req.user.id : null
      ]);

      const alertId = result.insertId;

      // Save photos
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          await db.query(`
            INSERT INTO vet_alert_photos (alert_id, file_path, file_name, file_size, file_type, display_order, is_primary)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            alertId,
            `/uploads/vet-alerts/${file.filename}`,
            file.originalname,
            file.size,
            file.mimetype,
            i,
            i === 0 ? 1 : 0
          ]);
        }
      }

      // Add to history
      await db.query(`
        INSERT INTO vet_alert_history (alert_id, action, new_status, notes, performed_by)
        VALUES (?, 'created', 'pending', 'Alert submitted', ?)
      `, [alertId, req.user ? req.user.id : null]);

      // Get created alert
      const [alerts] = await db.query('SELECT * FROM vet_alerts WHERE id = ?', [alertId]);

      res.status(201).json({
        success: true,
        message: 'Alert submitted successfully. It will be reviewed by our team.',
        data: alerts[0]
      });
    } catch (error) {
      console.error('Submit alert error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// =====================================================
// ADMIN ROUTES
// =====================================================

// GET pending alerts (admin)
router.get('/admin/pending', auth, authorize('admin'), async (req, res) => {
  try {
    const [alerts] = await db.query(`
      SELECT a.*, u.username as reporter_username,
             (SELECT COUNT(*) FROM vet_alert_photos WHERE alert_id = a.id) as photo_count
      FROM vet_alerts a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.status = 'pending'
      ORDER BY a.priority DESC, a.created_at ASC
    `);

    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Get pending alerts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT validate/approve alert (admin)
router.put('/:id/validate', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { validation_notes, priority } = req.body;
    const adminId = req.user.id;

    // Get current alert
    const [alerts] = await db.query('SELECT * FROM vet_alerts WHERE id = ?', [id]);
    if (alerts.length === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const oldStatus = alerts[0].status;

    // Update alert
    await db.query(`
      UPDATE vet_alerts
      SET status = 'approved', validated_by = ?, validated_at = NOW(),
          validation_notes = ?, priority = COALESCE(?, priority)
      WHERE id = ?
    `, [adminId, validation_notes || null, priority, id]);

    // Add to history
    await db.query(`
      INSERT INTO vet_alert_history (alert_id, action, old_status, new_status, notes, performed_by)
      VALUES (?, 'validated', ?, 'approved', ?, ?)
    `, [id, oldStatus, validation_notes || 'Alert approved', adminId]);

    const [updated] = await db.query('SELECT * FROM vet_alerts WHERE id = ?', [id]);
    res.json({ success: true, message: 'Alert approved', data: updated[0] });

    // Trigger vet alert notifications asynchronously
    setImmediate(async () => {
      try {
        const { createBulkNotifications } = require('../services/notificationService');
        // Get alert details
        const [alertsForNotif] = await db.query('SELECT * FROM vet_alerts WHERE id = ?', [req.params.id]);
        if (alertsForNotif.length > 0) {
          const alert = alertsForNotif[0];
          // Find users in the same country
          const [users] = await db.query(
            'SELECT id FROM users WHERE country = ? AND status = "active"',
            [alert.country]
          );
          if (users.length > 0) {
            await createBulkNotifications(
              users.map(u => u.id),
              {
                type: 'vet_alert',
                title_fr: `Alerte vétérinaire: ${alert.title_fr || alert.disease_name || 'Nouvelle alerte'}`,
                title_en: `Veterinary alert: ${alert.title_en || alert.disease_name || 'New alert'}`,
                message_fr: `Une alerte vétérinaire a été signalée dans votre pays (${alert.country}).`,
                message_en: `A veterinary alert has been reported in your country (${alert.country}).`,
                link: `/alertes-veterinaires/${alert.id}`,
                metadata: { alert_id: alert.id, type: alert.alert_type }
              }
            );
            console.log(`Vet alert ${alert.id}: notified ${users.length} users in ${alert.country}`);
          }
        }
      } catch (err) {
        console.error('Vet alert notification error:', err);
      }
    });
  } catch (error) {
    console.error('Validate alert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT reject alert (admin)
router.put('/:id/reject', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const adminId = req.user.id;

    const [alerts] = await db.query('SELECT * FROM vet_alerts WHERE id = ?', [id]);
    if (alerts.length === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const oldStatus = alerts[0].status;

    await db.query(`
      UPDATE vet_alerts
      SET status = 'rejected', validated_by = ?, validated_at = NOW(), rejection_reason = ?
      WHERE id = ?
    `, [adminId, rejection_reason || null, id]);

    await db.query(`
      INSERT INTO vet_alert_history (alert_id, action, old_status, new_status, notes, performed_by)
      VALUES (?, 'rejected', ?, 'rejected', ?, ?)
    `, [id, oldStatus, rejection_reason || 'Alert rejected', adminId]);

    res.json({ success: true, message: 'Alert rejected' });
  } catch (error) {
    console.error('Reject alert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT resolve alert (admin)
router.put('/:id/resolve', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution_notes, actions_taken } = req.body;
    const adminId = req.user.id;

    const [alerts] = await db.query('SELECT * FROM vet_alerts WHERE id = ?', [id]);
    if (alerts.length === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const oldStatus = alerts[0].status;

    await db.query(`
      UPDATE vet_alerts
      SET status = 'resolved', resolved_by = ?, resolved_at = NOW(),
          resolution_notes = ?, actions_taken = ?
      WHERE id = ?
    `, [adminId, resolution_notes || null, actions_taken || null, id]);

    await db.query(`
      INSERT INTO vet_alert_history (alert_id, action, old_status, new_status, notes, performed_by)
      VALUES (?, 'resolved', ?, 'resolved', ?, ?)
    `, [id, oldStatus, resolution_notes || 'Alert resolved', adminId]);

    const [updated] = await db.query('SELECT * FROM vet_alerts WHERE id = ?', [id]);
    res.json({ success: true, message: 'Alert resolved', data: updated[0] });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update alert (admin)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowedFields = [
      'alert_type', 'title_fr', 'title_en', 'description_fr', 'description_en',
      'country', 'region', 'city', 'location_details', 'latitude', 'longitude',
      'species', 'disease_name', 'symptoms', 'affected_count', 'dead_count', 'suspected_cause',
      'status', 'priority', 'is_public'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        if (key === 'species') {
          params.push(JSON.stringify(Array.isArray(value) ? value : [value]));
        } else {
          params.push(value);
        }
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    params.push(id);
    await db.query(`UPDATE vet_alerts SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM vet_alerts WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE alert (admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get photos to delete files
    const [photos] = await db.query('SELECT file_path FROM vet_alert_photos WHERE alert_id = ?', [id]);

    // Delete photos from filesystem
    for (const photo of photos) {
      const filePath = path.join(__dirname, '..', photo.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete alert (cascade deletes photos and history)
    await db.query('DELETE FROM vet_alerts WHERE id = ?', [id]);

    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
