const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');

router.get('/', async (req, res) => {
  try {
    const { farm_id, status, date_from, date_to, page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;
    let where = 'WHERE v.tenant_id = ?';
    const params = [req.tenant.id];
    if (farm_id) { where += ' AND v.farm_id = ?'; params.push(farm_id); }
    if (status) { where += ' AND v.status = ?'; params.push(status); }
    if (date_from) { where += ' AND v.visit_date >= ?'; params.push(date_from); }
    if (date_to) { where += ' AND v.visit_date <= ?'; params.push(date_to); }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_farm_visit v ${where}`, params);
    const [rows] = await db.query(
      `SELECT v.*, f.name as farm_name, u.username as vet_name
       FROM rv_farm_visit v LEFT JOIN rv_farm f ON v.farm_id = f.id LEFT JOIN users u ON v.vet_user_id = u.id
       ${where} ORDER BY v.visit_date DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, f.name as farm_name, u.username as vet_name
       FROM rv_farm_visit v LEFT JOIN rv_farm f ON v.farm_id = f.id LEFT JOIN users u ON v.vet_user_id = u.id
       WHERE v.id = ? AND v.tenant_id = ?`, [req.params.id, req.tenant.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body;
    if (!b.farm_id || !b.visit_date) return res.status(400).json({ success: false, message: 'farm_id, visit_date required' });
    const [result] = await db.query(
      `INSERT INTO rv_farm_visit (tenant_id, farm_id, vet_user_id, visit_date, visit_type, herds_inspected, general_findings, recommendations, follow_up_date, follow_up_notes, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.tenant.id, b.farm_id, b.vet_user_id || req.user.id, b.visit_date, b.visit_type || 'routine',
        b.herds_inspected ? JSON.stringify(b.herds_inspected) : null, b.general_findings || null,
        b.recommendations || null, b.follow_up_date || null, b.follow_up_notes || null, b.status || 'planned', req.user.id]
    );
    await logAudit(req.tenant.id, req.user.id, 'farm_visit', result.insertId, 'create', null, b, req.ip);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const fields = ['visit_date', 'visit_type', 'general_findings', 'recommendations', 'follow_up_date', 'follow_up_notes', 'status'];
    const updates = []; const values = [];
    for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
    if (req.body.herds_inspected !== undefined) { updates.push('herds_inspected = ?'); values.push(JSON.stringify(req.body.herds_inspected)); }
    if (!updates.length) return res.json({ success: true });
    values.push(req.params.id, req.tenant.id);
    await db.query(`UPDATE rv_farm_visit SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
    res.json({ success: true, message: 'Updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/:id/close', async (req, res) => {
  try {
    await db.query("UPDATE rv_farm_visit SET status = 'completed' WHERE id = ? AND tenant_id = ?", [req.params.id, req.tenant.id]);
    res.json({ success: true, message: 'Visit closed' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;
