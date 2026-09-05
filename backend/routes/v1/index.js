const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenantAuth');

// All v1 routes require auth + tenant context
router.use(auth, requireTenant);

// Module routers
router.use('/clinic', require('./clinic'));
router.use('/farm', require('./farm'));
router.use('/pharmacy', require('./pharmacy'));

// Tenant info endpoint
router.get('/tenant', (req, res) => {
  res.json({
    success: true,
    data: {
      tenant: req.tenant,
      role: req.rvRole,
      structure: req.structure,
      site: req.site
    }
  });
});

module.exports = router;
