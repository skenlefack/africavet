const express = require('express');
const router = express.Router();

router.use('/parties', require('./parties'));
router.use('/animals', require('./animals'));
router.use('/appointments', require('./appointments'));
router.use('/encounters', require('./encounters'));
router.use('/vaccinations', require('./vaccinations'));
router.use('/prescriptions', require('./prescriptions'));
router.use('/invoices', require('./invoices'));

// Reference data
router.use('/ref', require('./reference'));

module.exports = router;
