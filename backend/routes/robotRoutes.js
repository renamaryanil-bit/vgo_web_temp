const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/robotController');

router.get('/', ctrl.getAllRobots);
router.get('/:id', ctrl.getRobotById);
router.get('/:id/rides', ctrl.getRobotRides);
router.get('/:id/stats', ctrl.getRobotStats);

module.exports = router;
