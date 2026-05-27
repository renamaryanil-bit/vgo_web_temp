const Location = require('../models/Location');
const Robot = require('../models/Robot');
const Ride = require('../models/Ride');

// GET /api/dashboard/summary
async function getSummary(req, res) {
  try {
    const [totalLocations, totalRobots, activeRobots, distanceAgg, totalRides, recentRides] =
      await Promise.all([
        Location.countDocuments(),
        Robot.countDocuments(),
        Robot.countDocuments({ status: 'active' }),
        Robot.aggregate([
          { $group: { _id: null, total: { $sum: '$totalDistance' } } },
        ]),
        Ride.countDocuments(),
        Ride.find()
          .sort({ startTime: -1 })
          .limit(5)
          .populate('robot', 'robotId name')
          .populate('location', 'name code')
          .lean(),
      ]);

    const totalDistance = distanceAgg.length > 0 ? distanceAgg[0].total : 0;

    res.json({
      totalLocations,
      totalRobots,
      activeRobots,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalRides,
      recentRides,
    });
  } catch (error) {
    console.error('[dashboardController] getSummary error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSummary,
};
