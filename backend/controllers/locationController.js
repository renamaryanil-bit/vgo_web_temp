const Location = require('../models/Location');
const Robot = require('../models/Robot');
const Ride = require('../models/Ride');

// GET /api/locations
async function getAllLocations(req, res) {
  try {
    const locations = await Location.find().lean();

    // Aggregate robot stats per location in one query
    const robotStats = await Robot.aggregate([
      {
        $group: {
          _id: '$location',
          robotCount: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          totalDistance: { $sum: '$totalDistance' },
        },
      },
    ]);

    // Build a lookup map
    const statsMap = {};
    for (const stat of robotStats) {
      statsMap[stat._id.toString()] = stat;
    }

    // Merge stats into location objects
    const result = locations.map((loc) => {
      const stats = statsMap[loc._id.toString()] || {};
      return {
        ...loc,
        robotCount: stats.robotCount || 0,
        activeCount: stats.activeCount || 0,
        totalDistance: stats.totalDistance || 0,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('[locationController] getAllLocations error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/locations/:id
async function getLocationById(req, res) {
  try {
    const location = await Location.findById(req.params.id).lean();
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Aggregate stats for this single location
    const [stats] = await Robot.aggregate([
      { $match: { location: location._id } },
      {
        $group: {
          _id: null,
          robotCount: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          totalDistance: { $sum: '$totalDistance' },
        },
      },
    ]);

    res.json({
      ...location,
      robotCount: stats ? stats.robotCount : 0,
      activeCount: stats ? stats.activeCount : 0,
      totalDistance: stats ? stats.totalDistance : 0,
    });
  } catch (error) {
    console.error('[locationController] getLocationById error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/locations/:id/robots
async function getLocationRobots(req, res) {
  try {
    const robots = await Robot.find({ location: req.params.id })
      .sort({ status: 1, name: 1 })
      .lean();

    // Custom sort: active first, then idle, offline, maintenance
    const statusOrder = { active: 0, idle: 1, offline: 2, maintenance: 3 };
    robots.sort((a, b) => {
      const orderDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
      if (orderDiff !== 0) return orderDiff;
      return a.name.localeCompare(b.name);
    });

    res.json(robots);
  } catch (error) {
    console.error('[locationController] getLocationRobots error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/locations/:id/stats?period=hourly|daily
async function getLocationStats(req, res) {
  try {
    const period = req.query.period || 'daily';
    const locationId = req.params.id;
    const mongoose = require('mongoose');
    const locObjectId = new mongoose.Types.ObjectId(locationId);

    let startDate, groupBy, labelFormat;

    if (period === 'hourly') {
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
      groupBy = {
        year: { $year: '$startTime' },
        month: { $month: '$startTime' },
        day: { $dayOfMonth: '$startTime' },
        hour: { $hour: '$startTime' },
      };
    } else {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days
      groupBy = {
        year: { $year: '$startTime' },
        month: { $month: '$startTime' },
        day: { $dayOfMonth: '$startTime' },
      };
    }

    const pipeline = [
      {
        $match: {
          location: locObjectId,
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
    console.error('[locationController] getLocationStats error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllLocations,
  getLocationById,
  getLocationRobots,
  getLocationStats,
};
