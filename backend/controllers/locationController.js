const { supabase } = require('../db');
const Location = require('../models/Location');
const Robot = require('../models/Robot');
const { toCamelCase } = require('../utils/caseConverter');

// GET /api/locations
async function getAllLocations(req, res) {
  try {
    const locations = await Location.findAll();

    // Get robot stats per location via RPC
    const { data: robotStats, error: statsErr } = await supabase.rpc('get_location_robot_stats');
    if (statsErr) throw statsErr;

    // Build a lookup map
    const statsMap = {};
    for (const stat of (robotStats || [])) {
      statsMap[stat.location_id] = stat;
    }

    // Merge stats into location objects and convert to camelCase
    const result = locations.map((loc) => {
      const stats = statsMap[loc.id] || {};
      return {
        ...toCamelCase(loc),
        robotCount: Number(stats.robot_count) || 0,
        activeCount: Number(stats.active_count) || 0,
        totalDistance: stats.total_distance || 0,
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
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Get stats for this single location via RPC
    const { data: statsRows, error: statsErr } = await supabase.rpc('get_single_location_robot_stats', {
      loc_id: req.params.id,
    });
    if (statsErr) throw statsErr;

    const stats = statsRows && statsRows.length > 0 ? statsRows[0] : null;

    res.json({
      ...toCamelCase(location),
      robotCount: stats ? Number(stats.robot_count) : 0,
      activeCount: stats ? Number(stats.active_count) : 0,
      totalDistance: stats ? stats.total_distance : 0,
    });
  } catch (error) {
    console.error('[locationController] getLocationById error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/locations/:id/robots
async function getLocationRobots(req, res) {
  try {
    const robots = await Robot.findByLocation(req.params.id);

    // Custom sort: active first, then idle, offline, maintenance
    const statusOrder = { active: 0, idle: 1, offline: 2, maintenance: 3 };
    robots.sort((a, b) => {
      const orderDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
      if (orderDiff !== 0) return orderDiff;
      return a.name.localeCompare(b.name);
    });

    res.json(toCamelCase(robots));
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

    const { data: results, error } = await supabase.rpc('get_location_ride_stats', {
      loc_id: locationId,
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
