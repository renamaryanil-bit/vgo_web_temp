const { supabase } = require('../db');
const Robot = require('../models/Robot');
const Ride = require('../models/Ride');
const { toCamelCase } = require('../utils/caseConverter');

// GET /api/robots
async function getAllRobots(req, res) {
  try {
    // Join location data using Supabase's embedded select
    const robots = await Robot.findAll('*, location:locations(id, name, code)');

    res.json(toCamelCase(robots));
  } catch (error) {
    console.error('[robotController] getAllRobots error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/robots/:id
async function getRobotById(req, res) {
  try {
    const robot = await Robot.findById(req.params.id, '*, location:locations(*)');

    if (!robot) {
      return res.status(404).json({ error: 'Robot not found' });
    }

    res.json(toCamelCase(robot));
  } catch (error) {
    console.error('[robotController] getRobotById error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/robots/:id/rides?page=1&limit=20
async function getRobotRides(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const robotId = req.params.id;

    const [rides, total] = await Promise.all([
      Ride.findByRobot(robotId, {
        limit,
        offset,
        selectFields: '*, location:locations(name, code)',
      }),
      Ride.countByRobot(robotId),
    ]);

    res.json({
      rides: toCamelCase(rides),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[robotController] getRobotRides error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/robots/:id/stats?period=hourly|daily
async function getRobotStats(req, res) {
  try {
    const period = req.query.period || 'daily';
    const robotId = req.params.id;

    const { data: results, error } = await supabase.rpc('get_robot_ride_stats', {
      rob_id: robotId,
      period: period,
    });
    if (error) throw error;

    const data = (results || []).map((item) => {
      const d = new Date(item.bucket);
      let label;
      if (period === 'hourly') {
        label = d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
      } else {
        label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return { label, distance: Math.round(item.distance * 100) / 100 };
    });

    res.json(data);
  } catch (error) {
    console.error('[robotController] getRobotStats error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllRobots,
  getRobotById,
  getRobotRides,
  getRobotStats,
};
