const Robot = require('../models/Robot');
const Ride = require('../models/Ride');

// GET /api/robots
async function getAllRobots(req, res) {
  try {
    const robots = await Robot.find()
      .populate('location', 'name code')
      .sort({ robotId: 1 })
      .lean();

    res.json(robots);
  } catch (error) {
    console.error('[robotController] getAllRobots error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/robots/:id
async function getRobotById(req, res) {
  try {
    const robot = await Robot.findById(req.params.id)
      .populate('location')
      .lean();

    if (!robot) {
      return res.status(404).json({ error: 'Robot not found' });
    }

    res.json(robot);
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
    const skip = (page - 1) * limit;

    const robotId = req.params.id;

    const [rides, total] = await Promise.all([
      Ride.find({ robot: robotId })
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate('location', 'name code')
        .lean(),
      Ride.countDocuments({ robot: robotId }),
    ]);

    res.json({
      rides,
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
    const mongoose = require('mongoose');
    const robObjectId = new mongoose.Types.ObjectId(robotId);

    let startDate, groupBy;

    if (period === 'hourly') {
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      groupBy = {
        year: { $year: '$startTime' },
        month: { $month: '$startTime' },
        day: { $dayOfMonth: '$startTime' },
        hour: { $hour: '$startTime' },
      };
    } else {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      groupBy = {
        year: { $year: '$startTime' },
        month: { $month: '$startTime' },
        day: { $dayOfMonth: '$startTime' },
      };
    }

    const pipeline = [
      {
        $match: {
          robot: robObjectId,
          startTime: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          distance: { $sum: '$distance' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
    ];

    const results = await Ride.aggregate(pipeline);

    const data = results.map((item) => {
      let label;
      if (period === 'hourly') {
        const d = new Date(item._id.year, item._id.month - 1, item._id.day, item._id.hour);
        label = d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
      } else {
        const d = new Date(item._id.year, item._id.month - 1, item._id.day);
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
