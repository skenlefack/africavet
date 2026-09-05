const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');

router.get('/', async (req, res) => {
  try {
    const { farm_id, herd_lot_id, status, event_type, page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;
    let where = 'WHERE he.tenant_id = ?';
    const params = [req.tenant.id];
    if (farm_id) { where += ' AND he.farm_id = ?'; params.push(farm_id); }
    if (herd_lot_id) { where += ' AND he.herd_lot_id = ?'; params.push(herd_lot_id); }
    if (status) { where += ' AND he.status = ?'; params.push(status); }
    if (event_type) { where += ' AND he.event_type = ?'; params.push(event_type); }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_health_event he ${where}`, params);
    const [rows] = await db.query(
      `SELECT he.*, f.name as farm_name, h.name as herd_name
       FROM rv_health_event he LEFT JOIN rv_farm f ON he.farm_id = f.id LEFT JOIN rv_herd_lot h ON he.herd_lot_id = h.id
       ${where} ORDER BY he.event_date DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT he.*, f.name as farm_name, h.name as herd_name
       FROM rv_health_event he LEFT JOIN rv_farm f ON he.farm_id = f.id LEFT JOIN rv_herd_lot h ON he.herd_lot_id = h.id
       WHERE he.id = ? AND he.tenant_id = ?`, [req.params.id, req.tenant.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body;
    if (!b.farm_id || !b.event_date) return res.status(400).json({ success: false, message: 'farm_id, event_date required' });
    const [result] = await db.query(
      `INSERT INTO rv_health_event (tenant_id, farm_id, herd_lot_id, event_date, event_type, disease_suspected, animals_affected, animals_dead, symptoms, actions_taken, reported_to_authorities, report_date, notifiable_disease, lab_results, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.tenant.id, b.farm_id, b.herd_lot_id || null, b.event_date, b.event_type || 'observation',
        b.disease_suspected || null, b.animals_affected || 0, b.animals_dead || 0, b.symptoms || null,
        b.actions_taken || null, b.reported_to_authorities ? 1 : 0, b.report_date || null,
        b.notifiable_disease ? 1 : 0, b.lab_results || null, b.status || 'active', req.user.id]
    );
    await logAudit(req.tenant.id, req.user.id, 'health_event', result.insertId, 'create', null, b, req.ip);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const fields = ['event_date', 'event_type', 'disease_suspected', 'animals_affected', 'animals_dead', 'symptoms', 'actions_taken', 'reported_to_authorities', 'report_date', 'notifiable_disease', 'lab_results', 'status'];
    const updates = []; const values = [];
    for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
    if (!updates.length) return res.json({ success: true });
    values.push(req.params.id, req.tenant.id);
    await db.query(`UPDATE rv_health_event SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
    res.json({ success: true, message: 'Updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/:id/escalate', async (req, res) => {
  try {
    await db.query("UPDATE rv_health_event SET status = 'escalated' WHERE id = ? AND tenant_id = ?", [req.params.id, req.tenant.id]);
    await logAudit(req.tenant.id, req.user.id, 'health_event', req.params.id, 'status_change', null, { status: 'escalated' }, req.ip);
    res.json({ success: true, message: 'Escalated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/:id/resolve', async (req, res) => {
  try {
    await db.query("UPDATE rv_health_event SET status = 'resolved' WHERE id = ? AND tenant_id = ?", [req.params.id, req.tenant.id]);
    res.json({ success: true, message: 'Resolved' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;
