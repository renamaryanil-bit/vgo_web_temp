const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  robot: { type: mongoose.Schema.Types.ObjectId, ref: 'Robot', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  distance: { type: Number, required: true, default: 0 },
  encoderTicks: { type: Number, default: 0 },
  status: { type: String, enum: ['completed', 'in_progress', 'aborted'], default: 'completed' },
}, { timestamps: true });

rideSchema.index({ robot: 1, startTime: -1 });
rideSchema.index({ location: 1, startTime: -1 });

module.exports = mongoose.model('Ride', rideSchema);
