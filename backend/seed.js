const { connectDB, disconnectDB } = require('./db');
const Location = require('./models/Location');
const Robot = require('./models/Robot');
const Ride = require('./models/Ride');

// ── Helpers ──────────────────────────────────────────────────────────

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function log(color, tag, msg) {
  const colors = { green: '32', cyan: '36', yellow: '33', red: '31', magenta: '35' };
  const code = colors[color] || '0';
  console.log(`\x1b[${code}m[${tag}]\x1b[0m ${msg}`);
}

// ── Seed Data ────────────────────────────────────────────────────────

const LOCATIONS = [
  { name: 'London GP', code: 'LDN', address: 'London, United Kingdom', isActive: true },
  { name: 'Tokyo Ring', code: 'TKY', address: 'Tokyo, Japan', isActive: true },
  { name: 'Monaco Bay', code: 'MNC', address: 'Monte Carlo, Monaco', isActive: true },
  { name: 'Singapore Circuit', code: 'SGP', address: 'Singapore', isActive: true },
  { name: 'Austin Speed', code: 'AUS', address: 'Austin, Texas, USA', isActive: false },
];

const ROBOT_NAMES = [
  'Atlas', 'Titan', 'Nomad', 'Beacon', 'Sentinel',
  'Rover', 'Forge', 'Drift', 'Spark', 'Echo',
  'Pulse', 'Vector', 'Apex', 'Bolt', 'Comet',
];

const STATUSES = ['active', 'active', 'active', 'idle', 'idle', 'idle', 'idle', 'offline', 'maintenance'];

// ── Main ─────────────────────────────────────────────────────────────

async function seed(skipConnect = false) {
  log('cyan', 'SEED', 'Starting database seed...');

  if (!skipConnect) {
    await connectDB();
  }

  // Clear existing data
  await Promise.all([
    Location.deleteMany({}),
    Robot.deleteMany({}),
    Ride.deleteMany({}),
  ]);
  log('yellow', 'SEED', 'Cleared all collections');

  // Create locations
  const locations = await Location.insertMany(LOCATIONS);
  log('green', 'SEED', `Created ${locations.length} locations`);

  // Create robots — 3 per location
  const robotDocs = [];
  let robotIndex = 0;

  for (const loc of locations) {
    for (let i = 0; i < 3; i++) {
      const num = String(robotIndex + 1).padStart(3, '0');
      robotDocs.push({
        robotId: `VGO-${num}`,
        name: `VGO ${num}`,
        location: loc._id,
        status: pick(STATUSES),
        totalDistance: 0,
        lastActive: new Date(),
      });
      robotIndex++;
    }
  }

  const robots = await Robot.insertMany(robotDocs);
  log('green', 'SEED', `Created ${robots.length} robots`);

  // Create rides for each robot
  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  let totalRides = 0;

  for (const robot of robots) {
    const numRides = randInt(15, 25);
    const rides = [];

    for (let i = 0; i < numRides; i++) {
      // Spread rides across last 7 days, biased toward work hours (8-18)
      const dayOffset = rand(0, SEVEN_DAYS);
      let rideStart = new Date(now - dayOffset);

      // Bias toward work hours: 70% chance of work hours
      if (Math.random() < 0.7) {
        const workHour = randInt(8, 17);
        rideStart.setHours(workHour, randInt(0, 59), randInt(0, 59));
      }

      const durationMinutes = rand(5, 45);
      const rideEnd = new Date(rideStart.getTime() + durationMinutes * 60 * 1000);

      // Distance with variance: some robots are busier
      const busyFactor = rand(0.5, 1.5);
      const distance = Math.round(rand(50, 500) * busyFactor * 100) / 100;
      const ticks = Math.round(distance * rand(90, 110));

      // Most rides completed, ~8% aborted
      const rideStatus = Math.random() < 0.08 ? 'aborted' : 'completed';

      rides.push({
        robot: robot._id,
        location: robot.location,
        startTime: rideStart,
        endTime: rideEnd,
        distance,
        encoderTicks: ticks,
        status: rideStatus,
      });
    }

    await Ride.insertMany(rides);

    // Update robot's totalDistance to actual sum
    const totalDist = rides.reduce((sum, r) => sum + r.distance, 0);
    const latestRide = rides.reduce((latest, r) =>
      r.startTime > latest.startTime ? r : latest, rides[0]);

    await Robot.findByIdAndUpdate(robot._id, {
      totalDistance: Math.round(totalDist * 100) / 100,
      lastActive: latestRide.endTime || latestRide.startTime,
    });

    totalRides += numRides;
    log('magenta', 'SEED', `  ${robot.robotId} (${robot.name}): ${numRides} rides, ${Math.round(totalDist)}m total`);
  }

  log('green', 'SEED', `Created ${totalRides} rides total`);

  // Summary
  log('cyan', 'SEED', '────────────────────────────────────');
  log('cyan', 'SEED', 'Seed completed successfully!');
  log('cyan', 'SEED', `  Locations : ${locations.length}`);
  log('cyan', 'SEED', `  Robots    : ${robots.length}`);
  log('cyan', 'SEED', `  Rides     : ${totalRides}`);
  log('cyan', 'SEED', '────────────────────────────────────');

  if (!skipConnect) {
    await disconnectDB();
    process.exit(0);
  }
}

module.exports = seed;

if (require.main === module) {
  seed().catch((err) => {
    console.error('\x1b[31m[SEED]\x1b[0m Fatal error:', err);
    process.exit(1);
  });
}
