const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');

router.get('/', async (req, res) => {
  try {
    const { farm_id, page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;
    let where = 'WHERE h.tenant_id = ?';
    const params = [req.tenant.id];
    if (farm_id) { where += ' AND h.farm_id = ?'; params.push(farm_id); }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_herd_lot h ${where}`, params);
    const [rows] = await db.query(
      `SELECT h.*, f.name as farm_name, s.name_fr as species_name, b.name_fr as breed_name
       FROM rv_herd_lot h LEFT JOIN rv_farm f ON h.farm_id = f.id
       LEFT JOIN rv_species s ON h.species_id = s.id LEFT JOIN rv_breed b ON h.breed_id = b.id
       ${where} ORDER BY h.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT h.*, f.name as farm_name, s.name_fr as species_name, b.name_fr as breed_name
       FROM rv_herd_lot h LEFT JOIN rv_farm f ON h.farm_id = f.id
       LEFT JOIN rv_species s ON h.species_id = s.id LEFT JOIN rv_breed b ON h.breed_id = b.id
       WHERE h.id = ? AND h.tenant_id = ?`, [req.params.id, req.tenant.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body;
    if (!b.farm_id || !b.name) return res.status(400).json({ success: false, message: 'farm_id, name required' });
    const [result] = await db.query(
      `INSERT INTO rv_herd_lot (tenant_id, farm_id, name, species_id, breed_id, purpose, head_count, avg_age_months, housing_type, identification_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.tenant.id, b.farm_id, b.name, b.species_id || null, b.breed_id || null, b.purpose || 'mixed',
        b.head_count || 0, b.avg_age_months || null, b.housing_type || null, b.identification_method || null, b.notes || null]
    );
    await logAudit(req.tenant.id, req.user.id, 'herd_lot', result.insertId, 'create', null, b, req.ip);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const fields = ['name', 'species_id', 'breed_id', 'purpose', 'head_count', 'avg_age_months', 'housing_type', 'identification_method', 'notes', 'is_active'];
    const updates = []; const values = [];
    for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
    if (!updates.length) return res.json({ success: true });
    values.push(req.params.id, req.tenant.id);
    await db.query(`UPDATE rv_herd_lot SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
    res.json({ success: true, message: 'Updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/:id/adjust-headcount', async (req, res) => {
  try {
    const { head_count } = req.body;
    if (head_count === undefined) return res.status(400).json({ success: false, message: 'head_count required' });
    await db.query('UPDATE rv_herd_lot SET head_count = ? WHERE id = ? AND tenant_id = ?', [head_count, req.params.id, req.tenant.id]);
    res.json({ success: true, message: 'Head count updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;
