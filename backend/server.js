require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Initialize Supabase client (imported for side-effect: validates env vars)
require('./db');

const locationRoutes = require('./routes/locationRoutes');
const robotRoutes = require('./routes/robotRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

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

app.get("/", (req, res) => {
  res.send("Server is alive");
});

// Start
async function start() {
  // Auto-seed if database is empty
  try {
    const Robot = require('./models/Robot');
    const robotCount = await Robot.count();
    if (robotCount === 0) {
      console.log('\x1b[33m[SERVER]\x1b[0m Database is empty. Executing auto-seed...');
      const seed = require('./seed');
      await seed();
      console.log('\x1b[32m[SERVER]\x1b[0m Database auto-seeded successfully!');
    }
  } catch (seedErr) {
    console.error('\x1b[31m[SERVER]\x1b[0m Auto-seed failed:', seedErr.message);
  }

  app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

}

start();
