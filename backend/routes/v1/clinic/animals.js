const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');

// GET /api/v1/clinic/animals
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    const { search, species_id, owner_id, alive, page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE a.tenant_id = ?';
    const params = [tenantId];

    if (search) {
      where += ' AND (a.name LIKE ? OR a.animal_code LIKE ? OR a.microchip_number LIKE ? OR p.display_name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (species_id) { where += ' AND a.species_id = ?'; params.push(species_id); }
    if (owner_id) { where += ' AND a.owner_party_id = ?'; params.push(owner_id); }
    if (alive !== undefined) { where += ' AND a.is_alive = ?'; params.push(alive === 'true' ? 1 : 0); }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM rv_animal a LEFT JOIN rv_party p ON a.owner_party_id = p.id ${where}`, params
    );

    const [rows] = await db.query(
      `SELECT a.*, s.name_fr as species_name, s.code as species_code, b.name_fr as breed_name,
              p.display_name as owner_name, p.phone_primary as owner_phone
       FROM rv_animal a
       LEFT JOIN rv_species s ON a.species_id = s.id
       LEFT JOIN rv_breed b ON a.breed_id = b.id
       LEFT JOIN rv_party p ON a.owner_party_id = p.id
       ${where}
       ORDER BY a.updated_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true, data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error listing animals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/v1/clinic/animals/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, s.name_fr as species_name, s.code as species_code, b.name_fr as breed_name,
              p.display_name as owner_name, p.phone_primary as owner_phone, p.id as owner_id
       FROM rv_animal a
       LEFT JOIN rv_species s ON a.species_id = s.id
       LEFT JOIN rv_breed b ON a.breed_id = b.id
       LEFT JOIN rv_party p ON a.owner_party_id = p.id
       WHERE a.id = ? AND a.tenant_id = ?`,
      [req.params.id, req.tenant.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Animal not found' });

    const [identifiers] = await db.query('SELECT * FROM rv_animal_identifier WHERE animal_id = ?', [req.params.id]);

    res.json({ success: true, data: { ...rows[0], identifiers } });
  } catch (error) {
    console.error('Error fetching animal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/v1/clinic/animals
router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const tenantId = req.tenant.id;
    const {
      owner_party_id, name, species_id, breed_id, sex, date_of_birth,
      estimated_age_months, color_markings, weight_kg, reproductive_status,
      microchip_number, tattoo_number, ear_tag_number, passport_number,
      photo_url, allergies, medical_history_summary, farm_id, herd_id, notes,
      identifiers
    } = req.body;

    if (!owner_party_id || !species_id) {
      return res.status(400).json({ success: false, message: 'owner_party_id and species_id are required' });
    }

    // Generate animal code
    const [[{ cnt }]] = await conn.query('SELECT COUNT(*) as cnt FROM rv_animal WHERE tenant_id = ?', [tenantId]);
    const animal_code = `ANI-${String(cnt + 1).padStart(6, '0')}`;

    const [result] = await conn.query(
      `INSERT INTO rv_animal (tenant_id, animal_code, owner_party_id, name, species_id, breed_id, sex,
        date_of_birth, estimated_age_months, color_markings, weight_kg, reproductive_status,
        microchip_number, tattoo_number, ear_tag_number, passport_number, photo_url,
        allergies, medical_history_summary, farm_id, herd_id, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, animal_code, owner_party_id, name || null, species_id, breed_id || null,
        sex || 'unknown', date_of_birth || null, estimated_age_months || null,
        color_markings || null, weight_kg || null, reproductive_status || 'unknown',
        microchip_number || null, tattoo_number || null, ear_tag_number || null,
        passport_number || null, photo_url || null, allergies || null,
        medical_history_summary || null, farm_id || null, herd_id || null,
        notes || null, req.user.id]
    );

    const animalId = result.insertId;

    if (identifiers && identifiers.length > 0) {
      for (const id of identifiers) {
        await conn.query(
          'INSERT INTO rv_animal_identifier (animal_id, identifier_type, identifier_value, applied_date, notes) VALUES (?, ?, ?, ?, ?)',
          [animalId, id.identifier_type, id.identifier_value, id.applied_date || null, id.notes || null]
        );
      }
    }

    await conn.commit();
    await logAudit(tenantId, req.user.id, 'animal', animalId, 'create', null, req.body, req.ip);

    res.status(201).json({ success: true, data: { id: animalId, animal_code } });
  } catch (error) {
    await conn.rollback();
    console.error('Error creating animal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// PUT /api/v1/clinic/animals/:id
router.put('/:id', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const animalId = req.params.id;
    const tenantId = req.tenant.id;

    const [existing] = await conn.query('SELECT * FROM rv_animal WHERE id = ? AND tenant_id = ?', [animalId, tenantId]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Animal not found' });

    const fields = ['owner_party_id', 'name', 'species_id', 'breed_id', 'sex', 'date_of_birth',
      'estimated_age_months', 'color_markings', 'weight_kg', 'reproductive_status',
      'microchip_number', 'tattoo_number', 'ear_tag_number', 'passport_number', 'photo_url',
      'allergies', 'medical_history_summary', 'is_alive', 'death_date', 'death_cause',
      'farm_id', 'herd_id', 'notes'];

    const updates = [];
    const values = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    }

    if (updates.length > 0) {
      values.push(animalId, tenantId);
      await conn.query(`UPDATE rv_animal SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
    }

    if (req.body.identifiers) {
      await conn.query('DELETE FROM rv_animal_identifier WHERE animal_id = ?', [animalId]);
      for (const id of req.body.identifiers) {
        await conn.query(
          'INSERT INTO rv_animal_identifier (animal_id, identifier_type, identifier_value, applied_date, notes) VALUES (?, ?, ?, ?, ?)',
          [animalId, id.identifier_type, id.identifier_value, id.applied_date || null, id.notes || null]
        );
      }
    }

    await conn.commit();
    await logAudit(tenantId, req.user.id, 'animal', animalId, 'update', existing[0], req.body, req.ip);

    res.json({ success: true, message: 'Animal updated' });
  } catch (error) {
    await conn.rollback();
    console.error('Error updating animal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
