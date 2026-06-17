const { supabase } = require('../db');
const Location = require('../models/Location');
const Robot = require('../models/Robot');
const Ride = require('../models/Ride');
const { toCamelCase } = require('../utils/caseConverter');

// GET /api/dashboard/summary
async function getSummary(req, res) {
  try {
    const [totalLocations, totalRobots, activeRobots, totalDistance, totalRides] =
      await Promise.all([
        Location.count(),
        Robot.count(),
        Robot.countByStatus('active'),
        Robot.sumTotalDistance(),
        Ride.count(),
      ]);

    // Recent rides with robot + location info via Supabase join syntax
    const { data: recentRides, error: ridesErr } = await supabase
      .from('rides')
      .select('*, robot:robots(robot_id, name), location:locations(name, code)')
      .order('start_time', { ascending: false })
      .limit(5);

    if (ridesErr) throw ridesErr;

    res.json({
      totalLocations,
      totalRobots,
      activeRobots,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalRides,
      recentRides: toCamelCase(recentRides),
    });
  } catch (error) {
    console.error('[dashboardController] getSummary error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSummary,
};
