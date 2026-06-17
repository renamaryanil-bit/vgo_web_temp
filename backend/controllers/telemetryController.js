const { supabase } = require('../db');
const Robot = require('../models/Robot');
const Ride = require('../models/Ride');
const { toCamelCase } = require('../utils/caseConverter');

// POST /api/telemetry
async function ingestRide(req, res) {
  try {
    const { robotId, distance, encoderTicks, startTime, endTime, status } = req.body;

    if (!robotId) {
      return res.status(400).json({ error: 'robotId is required' });
    }

    // Find the robot by its string robotId (e.g. 'VGO-001')
    const robot = await Robot.findOne({ robot_id: robotId });
    if (!robot) {
      return res.status(404).json({ error: `Robot '${robotId}' not found` });
    }

    // Create the ride
    const ride = await Ride.create({
      robot_id: robot.id,
      location_id: robot.location_id,
      start_time: startTime || new Date().toISOString(),
      end_time: endTime || null,
      distance: distance || 0,
      encoder_ticks: encoderTicks || 0,
      status: status || 'completed',
    });

    // Update robot's cumulative distance, lastActive, and status
    const updateData = {
      total_distance: robot.total_distance + (distance || 0),
      last_active: new Date().toISOString(),
    };
    if (status === 'in_progress') {
      updateData.status = 'active';
    }
    await Robot.updateById(robot.id, updateData);

    // Fetch the ride with joined robot + location data for the response
    const { data: populated, error: popErr } = await supabase
      .from('rides')
      .select('*, robot:robots(robot_id, name), location:locations(name, code)')
      .eq('id', ride.id)
      .single();

    if (popErr) throw popErr;

    res.status(201).json(toCamelCase(populated));
  } catch (error) {
    console.error('[telemetryController] ingestRide error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  ingestRide,
};
