const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/locationController');

router.get('/', ctrl.getAllLocations);
router.get('/:id', ctrl.getLocationById);
router.get('/:id/robots', ctrl.getLocationRobots);
router.get('/:id/stats', ctrl.getLocationStats);

module.exports = router;
