const express = require('express');
const router = express.Router();
const db = require('../../../config/db');

// GET /api/v1/clinic/ref/species
router.get('/species', async (req, res) => {
  try {
    const [species] = await db.query('SELECT * FROM rv_species ORDER BY sort_order, name_fr');
    res.json({ success: true, data: species });
  } catch (error) {
    console.error('Error fetching species:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/v1/clinic/ref/breeds?species_id=
router.get('/breeds', async (req, res) => {
  try {
    let query = 'SELECT * FROM rv_breed';
    const params = [];
    if (req.query.species_id) {
      query += ' WHERE species_id = ?';
      params.push(req.query.species_id);
    }
    query += ' ORDER BY name_fr';
    const [breeds] = await db.query(query, params);
    res.json({ success: true, data: breeds });
  } catch (error) {
    console.error('Error fetching breeds:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
