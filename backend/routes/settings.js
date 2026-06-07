const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// GET all settings (public)
router.get('/public', async (req, res) => {
  try {
    const [settings] = await db.query('SELECT setting_key, setting_value FROM settings');
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.setting_key] = s.setting_value; });
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('Settings public error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all settings (admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { group } = req.query;
    let query = 'SELECT * FROM settings';
    let params = [];

    if (group) {
      query += ' WHERE setting_group = ?';
      params.push(group);
    }

    const [settings] = await db.query(query + ' ORDER BY setting_group, setting_key', params);
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET SMTP settings
router.get('/smtp', auth, authorize('admin'), async (req, res) => {
  try {
    const [settings] = await db.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_group = 'smtp'"
    );
    const smtp = {};
    settings.forEach(s => {
      const key = s.setting_key.replace('smtp_', '');
      smtp[key] = s.setting_value;
    });
    res.json({ success: true, data: smtp });
  } catch (error) {
    console.error('SMTP settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT SMTP settings
router.put('/smtp', auth, authorize('admin'), async (req, res) => {
  try {
    const { host, port, secure, user, pass, from } = req.body;
    const fields = { smtp_host: host, smtp_port: port, smtp_secure: secure, smtp_user: user, smtp_pass: pass, smtp_from: from };

    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      const stringValue = String(value || '');
      const [existing] = await db.query('SELECT id FROM settings WHERE setting_key = ?', [key]);
      if (existing.length === 0) {
        await db.query(
          "INSERT INTO settings (setting_key, setting_value, setting_group, autoload) VALUES (?, ?, 'smtp', 1)",
          [key, stringValue]
        );
      } else {
        await db.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [stringValue, key]);
      }
    }

    res.json({ success: true, message: 'SMTP settings updated' });
  } catch (error) {
    console.error('SMTP update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST SMTP test
router.post('/smtp/test', auth, authorize('admin'), async (req, res) => {
  try {
    const { host, port, secure, user, pass, from } = req.body;

    if (!host || !user || !pass) {
      return res.status(400).json({ success: false, message: 'Host, user and password are required' });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port) || 587,
      secure: secure === 'true' || secure === true,
      auth: { user, pass },
      connectionTimeout: 10000
    });

    await transporter.verify();

    // Send a real test email to the admin
    const adminEmail = req.user.email || from;
    await transporter.sendMail({
      from: `"AfricaVET Test" <${from || user}>`,
      to: adminEmail,
      subject: 'AfricaVET - Test SMTP',
      html: '<p>SMTP configuration is working correctly.</p><p>Configuration SMTP fonctionnelle.</p>'
    });

    res.json({ success: true, message: 'Connection successful, test email sent' });
  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET single setting
router.get('/:key', async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM settings WHERE setting_key = ?', [req.params.key]);
    if (settings.length === 0) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.json({ success: true, data: settings[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update setting
router.put('/:key', auth, authorize('admin'), async (req, res) => {
  try {
    const { value, group, autoload } = req.body;
    
    const [existing] = await db.query('SELECT * FROM settings WHERE setting_key = ?', [req.params.key]);
    
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO settings (setting_key, setting_value, setting_group, autoload) VALUES (?, ?, ?, ?)',
        [req.params.key, value, group || 'general', autoload !== undefined ? autoload : true]
      );
    } else {
      await db.query(
        'UPDATE settings SET setting_value = ?, setting_group = COALESCE(?, setting_group), autoload = COALESCE(?, autoload) WHERE setting_key = ?',
        [value, group, autoload, req.params.key]
      );
    }

    res.json({ success: true, message: 'Setting updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT bulk update settings
router.put('/', auth, authorize('admin'), async (req, res) => {
  try {
    let { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ success: false, message: 'Settings is required' });
    }

    // Handle both array format [{ setting_key, setting_value }] and object format { key: value }
    let settingsToUpdate = [];

    if (Array.isArray(settings)) {
      // Array format from admin: [{ setting_key: 'key', setting_value: 'value' }, ...]
      settingsToUpdate = settings.map(s => ({
        key: s.setting_key,
        value: s.setting_value
      }));
    } else if (typeof settings === 'object') {
      // Object format: { key: value, ... }
      settingsToUpdate = Object.entries(settings).map(([key, value]) => ({ key, value }));
    } else {
      return res.status(400).json({ success: false, message: 'Invalid settings format' });
    }

    for (const { key, value } of settingsToUpdate) {
      // Convert value to string for storage
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');

      const [existing] = await db.query('SELECT * FROM settings WHERE setting_key = ?', [key]);

      if (existing.length === 0) {
        await db.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [key, stringValue]);
      } else {
        await db.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [stringValue, key]);
      }
    }

    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// DELETE setting
router.delete('/:key', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM settings WHERE setting_key = ?', [req.params.key]);
    res.json({ success: true, message: 'Setting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
