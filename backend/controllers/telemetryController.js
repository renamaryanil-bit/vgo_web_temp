const Robot = require('../models/Robot');
const Ride = require('../models/Ride');

// POST /api/telemetry
async function ingestRide(req, res) {
  try {
    const { robotId, distance, encoderTicks, startTime, endTime, status } = req.body;

    if (!robotId) {
      return res.status(400).json({ error: 'robotId is required' });
    }

    // Find the robot by its string robotId (e.g. 'VGO-001')
    const robot = await Robot.findOne({ robotId });
    if (!robot) {
      return res.status(404).json({ error: `Robot '${robotId}' not found` });
    }

    // Create the ride
    const ride = await Ride.create({
      robot: robot._id,
      location: robot.location,
      startTime: startTime || new Date(),
      endTime: endTime || null,
      distance: distance || 0,
      encoderTicks: encoderTicks || 0,
      status: status || 'completed',
    });

    // Update robot's cumulative distance, lastActive, and status
    robot.totalDistance += (distance || 0);
    robot.lastActive = new Date();
    if (status === 'in_progress') {
      robot.status = 'active';
    }
    await robot.save();

    // Populate and return
    const populated = await Ride.findById(ride._id)
      .populate('robot', 'robotId name')
      .populate('location', 'name code')
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    console.error('[telemetryController] ingestRide error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  ingestRide,
};
