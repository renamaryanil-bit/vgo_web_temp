const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/telemetryController');

router.post('/', ctrl.ingestRide);

module.exports = router;
