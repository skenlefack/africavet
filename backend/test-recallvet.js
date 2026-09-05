/**
 * RecallVET Integration Test Script
 * Run: node test-recallvet.js
 */
require('dotenv').config();
const db = require('./config/db');
const jwt = require('jsonwebtoken');
const http = require('http');
const express = require('express');

async function fullTest() {
  // 1. Get an existing user
  const [users] = await db.query('SELECT id, username, role FROM users WHERE status = "active" LIMIT 1');
  if (!users.length) { console.log('No active user found'); process.exit(1); }
  const user = users[0];
  console.log('Using user:', user.username, '(id:', user.id, ', role:', user.role + ')');

  // 2. Create tenant + structure + site
  const [existing] = await db.query('SELECT id FROM rv_tenant WHERE slug = "test-clinic"');
  let tenantId;
  if (existing.length) {
    tenantId = existing[0].id;
    console.log('Tenant exists, id:', tenantId);
  } else {
    const [t] = await db.query("INSERT INTO rv_tenant (name, slug, country_code, default_currency) VALUES ('Clinique Test', 'test-clinic', 'CM', 'XAF')");
    tenantId = t.insertId;
    const [s] = await db.query('INSERT INTO rv_structure (tenant_id, name, type) VALUES (?, "Structure Test", "mixed")', [tenantId]);
    const [si] = await db.query('INSERT INTO rv_site (structure_id, name, city) VALUES (?, "Site Principal", "Yaounde")', [s.insertId]);
    await db.query('INSERT IGNORE INTO rv_user_tenant (user_id, tenant_id, structure_id, site_id, role) VALUES (?, ?, ?, ?, "owner")', [user.id, tenantId, s.insertId, si.insertId]);
    console.log('Created tenant id:', tenantId);
  }

  // 3. Generate JWT
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // 4. Start test server
  const app = express();
  app.use(express.json());
  app.use('/api/v1', require('./routes/v1/index'));
  app.use((err, req, res, next) => { console.error('Route error:', err.message); res.status(500).json({ success: false, message: err.message }); });

  const server = app.listen(5098, async () => {
    console.log('Test server on :5098\n');

    const request = (method, path, body) => new Promise((resolve, reject) => {
      const data = body ? JSON.stringify(body) : null;
      const opts = {
        hostname: 'localhost', port: 5098, path, method,
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'X-Tenant-Id': String(tenantId) }
      };
      if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
      const req = http.request(opts, (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
          catch(e) { resolve({ status: res.statusCode, body: raw }); }
        });
      });
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });

    let passed = 0, failed = 0;
    const test = async (label, method, path, body, expectStatus) => {
      try {
        const r = await request(method, path, body);
        const ok = r.status === expectStatus;
        console.log((ok ? 'PASS' : 'FAIL') + ' ' + label + ' [' + r.status + ']' + (r.body.data?.id ? ' id=' + r.body.data.id : '') + (r.body.data?.client_code || r.body.data?.animal_code || r.body.data?.farm_code || r.body.data?.prescription_number || r.body.data?.invoice_number || ''));
        if (!ok) { console.log('  Expected:', expectStatus, 'Got:', r.status, r.body.message || ''); failed++; }
        else passed++;
        return r.body;
      } catch(e) { console.log('FAIL ' + label + ' - ' + e.message); failed++; return null; }
    };

    // Run tests
    await test('GET tenant', 'GET', '/api/v1/tenant', null, 200);
    await test('GET species', 'GET', '/api/v1/clinic/ref/species', null, 200);
    await test('GET breeds', 'GET', '/api/v1/clinic/ref/breeds?species_id=1', null, 200);

    const party = await test('POST party', 'POST', '/api/v1/clinic/parties', {
      party_type: 'individual', display_name: 'Jean Kamga', first_name: 'Jean', last_name: 'Kamga',
      phone_primary: '+237699001122', city: 'Yaounde', customer_segment: 'private'
    }, 201);
    const partyId = party?.data?.id;

    await test('GET parties', 'GET', '/api/v1/clinic/parties', null, 200);
    await test('GET party', 'GET', '/api/v1/clinic/parties/' + partyId, null, 200);

    const animal = await test('POST animal', 'POST', '/api/v1/clinic/animals', {
      owner_party_id: partyId, name: 'Rex', species_id: 1, sex: 'M', weight_kg: 25
    }, 201);
    const animalId = animal?.data?.id;

    await test('GET animals', 'GET', '/api/v1/clinic/animals', null, 200);
    await test('GET animal', 'GET', '/api/v1/clinic/animals/' + animalId, null, 200);

    const appt = await test('POST appointment', 'POST', '/api/v1/clinic/appointments', {
      animal_id: animalId, party_id: partyId, vet_user_id: user.id,
      scheduled_date: '2026-09-10', start_time: '09:00', reason: 'Vaccination'
    }, 201);
    const apptId = appt?.data?.id;

    await test('POST check-in', 'POST', '/api/v1/clinic/appointments/' + apptId + '/check-in', {}, 200);
    const conv = await test('POST convert', 'POST', '/api/v1/clinic/appointments/' + apptId + '/convert', {}, 200);
    const encId = conv?.data?.encounter_id;

    await test('PUT encounter', 'PUT', '/api/v1/clinic/encounters/' + encId, {
      visit_reason: 'Vaccination antirabique', temperature_c: 38.5, weight_kg: 25.2,
      clinical_findings: 'Animal en bonne sante', clinical_plan: 'Vaccination + vermifuge',
      status: 'completed'
    }, 200);

    await test('POST sign', 'POST', '/api/v1/clinic/encounters/' + encId + '/sign', {}, 200);
    await test('GET encounters', 'GET', '/api/v1/clinic/encounters', null, 200);

    await test('POST vaccination', 'POST', '/api/v1/clinic/vaccinations', {
      animal_id: animalId, encounter_id: encId, product_name: 'Rabigen Mono',
      manufacturer: 'Virbac', lot_number: 'LOT-2026-001',
      vaccination_date: '2026-09-05T10:00:00Z', route: 'SC', next_due_date: '2027-09-05'
    }, 201);

    const rx = await test('POST prescription', 'POST', '/api/v1/clinic/prescriptions', {
      animal_id: animalId, party_id: partyId,
      lines: [{ product_name: 'Amoxicilline 500mg', dosage: '500mg', frequency: '2x/jour', duration_days: 7, quantity: 14 }]
    }, 201);

    await test('GET prescriptions', 'GET', '/api/v1/clinic/prescriptions', null, 200);
    await test('GET prescription', 'GET', '/api/v1/clinic/prescriptions/' + rx?.data?.id, null, 200);

    // Pharmacy
    const prod = await test('POST product', 'POST', '/api/v1/pharmacy/products', {
      name: 'Amoxicilline 500mg', sku: 'AMOX-500', unit: 'tablet', unit_price: 250
    }, 201);

    const supp = await test('POST supplier', 'POST', '/api/v1/pharmacy/suppliers', {
      name: 'PharmaVet Cameroun', phone: '+237677889900'
    }, 201);

    const po = await test('POST purchase-order', 'POST', '/api/v1/pharmacy/purchase-orders', {
      supplier_id: supp?.data?.id, lines: [{ product_id: prod?.data?.id, quantity_ordered: 100, unit_cost: 150 }]
    }, 201);

    await test('POST submit PO', 'POST', '/api/v1/pharmacy/purchase-orders/' + po?.data?.id + '/submit', {}, 200);

    // Stock location
    const loc = await test('POST location', 'POST', '/api/v1/pharmacy/stock/locations', { name: 'Depot Principal' }, 201);

    // Goods receipt
    const gr = await test('POST goods-receipt', 'POST', '/api/v1/pharmacy/goods-receipts', {
      po_id: po?.data?.id, supplier_id: supp?.data?.id, lines: [{
        product_id: prod?.data?.id, lot_number: 'LOT-001', batch_number: 'BATCH-A',
        expiry_date: '2027-12-31', quantity_received: 50, unit_cost: 150, location_id: loc?.data?.id
      }]
    }, 201);

    await test('GET stock levels', 'GET', '/api/v1/pharmacy/stock/levels', null, 200);
    await test('GET stock lots', 'GET', '/api/v1/pharmacy/stock/lots', null, 200);

    // Retail sale
    const lots = await request('GET', '/api/v1/pharmacy/stock/lots?product_id=' + prod?.data?.id);
    const lotId = lots.body?.data?.[0]?.id;

    await test('POST retail-sale', 'POST', '/api/v1/pharmacy/sales', {
      payment_method: 'cash',
      lines: [{ product_id: prod?.data?.id, lot_id: lotId, quantity: 5, unit_price: 250 }]
    }, 201);

    await test('GET sales', 'GET', '/api/v1/pharmacy/sales', null, 200);

    // Farm
    const farm = await test('POST farm', 'POST', '/api/v1/farm/farms', {
      owner_party_id: partyId, name: 'Ferme Kamga', farm_type: 'mixed', city: 'Bafoussam'
    }, 201);

    const herd = await test('POST herd', 'POST', '/api/v1/farm/herds', {
      farm_id: farm?.data?.id, name: 'Bovins laitiers', species_id: 3, purpose: 'dairy', head_count: 25
    }, 201);

    await test('POST farm-visit', 'POST', '/api/v1/farm/visits', {
      farm_id: farm?.data?.id, visit_date: '2026-09-05', visit_type: 'routine',
      general_findings: 'Troupeau en bonne sante', recommendations: 'Maintenir le programme vaccinal'
    }, 201);

    await test('POST health-event', 'POST', '/api/v1/farm/health-events', {
      farm_id: farm?.data?.id, herd_lot_id: herd?.data?.id, event_date: '2026-09-04',
      event_type: 'observation', disease_suspected: 'Aucune', animals_affected: 0
    }, 201);

    // Invoice
    const inv = await test('POST invoice', 'POST', '/api/v1/clinic/invoices', {
      party_id: partyId, animal_id: animalId,
      lines: [
        { description: 'Consultation', quantity: 1, unit_price: 15000 },
        { description: 'Vaccination', quantity: 1, unit_price: 10000 }
      ]
    }, 201);

    await test('POST payment', 'POST', '/api/v1/clinic/invoices/' + inv?.data?.id + '/pay', {
      amount: 25000, payment_method: 'mobile_money', payment_reference: 'OM-123456'
    }, 200);

    // Summary
    console.log('\n========================================');
    console.log('RESULTS: ' + passed + ' passed, ' + failed + ' failed');
    console.log('========================================');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  });
}

fullTest().catch(e => { console.error('Fatal:', e); process.exit(1); });
