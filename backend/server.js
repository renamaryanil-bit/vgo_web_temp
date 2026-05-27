require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

const locationRoutes = require('./routes/locationRoutes');
const robotRoutes = require('./routes/robotRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/locations', locationRoutes);
app.use('/api/robots', robotRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start
async function start() {
  await connectDB();
  
  // Auto-seed if database is empty (common for in-memory MongoDB boots)
  try {
    const Robot = require('./models/Robot');
    const robotCount = await Robot.countDocuments();
    if (robotCount === 0) {
      console.log('\x1b[33m[SERVER]\x1b[0m In-memory datastore is empty. Executing auto-seed...');
      const seed = require('./seed');
      await seed(true); // skipConnect = true since mongoose is already connected
      console.log('\x1b[32m[SERVER]\x1b[0m Database auto-seeded successfully!');
    }
  } catch (seedErr) {
    console.error('\x1b[31m[SERVER]\x1b[0m Auto-seed failed:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`\x1b[32m[SERVER]\x1b[0m Running on http://localhost:${PORT}`);
  });
}

start();
