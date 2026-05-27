const mongoose = require('mongoose');

const robotSchema = new mongoose.Schema({
  robotId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  status: { type: String, enum: ['active', 'idle', 'offline', 'maintenance'], default: 'idle' },
  totalDistance: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Robot', robotSchema);
