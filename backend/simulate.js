const http = require('http');

const SERVER_URL = 'http://localhost:5000';
const ENCODER_TICK_CONSTANT = 0.0314159; // Distance in meters per encoder tick (10cm radius wheel, 20 slot encoder)

function log(color, tag, msg) {
  const colors = { green: '32', cyan: '36', yellow: '33', red: '31', magenta: '35' };
  const code = colors[color] || '0';
  console.log(`\x1b[${code}m[${tag}]\x1b[0m ${msg}`);
}

// Helper to make HTTP requests using Node standard library
function makeRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runSimulator() {
  log('cyan', 'SIMULATOR', 'Initializing Telemetry Simulator...');
  log('cyan', 'SIMULATOR', `Connecting to telemetry server: ${SERVER_URL}`);

  try {
    // 1. Fetch robots list to know who is online
    const robots = await makeRequest(`${SERVER_URL}/api/robots`);
    if (!robots || robots.length === 0) {
      log('red', 'ERROR', 'No robots found in database. Make sure to run the seed script first!');
      process.exit(1);
    }

    log('green', 'SIMULATOR', `Located ${robots.length} robots in standard register.`);
    log('green', 'SIMULATOR', 'Telemetry transmission line established. Broadcasting starts now...');
    log('cyan', 'SIMULATOR', '---------------------------------------------------------');

    // 2. Loop and generate simulated ride sessions
    setInterval(async () => {
      try {
        // Pick a random robot
        const robot = robots[Math.floor(Math.random() * robots.length)];

        // Simulate encoder telemetry calculation
        const encoderTicks = Math.floor(Math.random() * 8000) + 1000; // 1000 to 9000 ticks
        const rawDistance = encoderTicks * ENCODER_TICK_CONSTANT; // meters
        const distance = Math.round(rawDistance * 100) / 100; // Round to 2 decimal places

        // Ride parameters
        const durationMinutes = Math.floor(Math.random() * 20) + 5; // 5 to 25 mins
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - durationMinutes * 60 * 1000);

        // Status ratio: 85% completed, 10% in_progress, 5% aborted
        const rand = Math.random();
        let status = 'completed';
        let customEndTime = endTime;

        if (rand < 0.10) {
          status = 'in_progress';
          customEndTime = null; // currently running
        } else if (rand < 0.15) {
          status = 'aborted';
        }

        // Telemetry bundle
        const telemetryBundle = {
          robotId: robot.robotId,
          distance: status === 'in_progress' ? 0 : distance, // distance accumulates on finish
          encoderTicks: encoderTicks,
          startTime: startTime.toISOString(),
          endTime: customEndTime ? customEndTime.toISOString() : null,
          status: status,
        };

        log(
          'yellow',
          'TRANSMIT',
          `Unit ${robot.robotId} (${robot.name}) sending telemetry packet...`
        );
        log(
          'magenta',
          'CALC',
          `  [Pulse Count]: ${encoderTicks} ticks | [Encoder Ratio]: ${ENCODER_TICK_CONSTANT.toFixed(5)}m/tick`
        );
        log(
          'magenta',
          'CALC',
          `  [Calculated Range]: ${distance} meters | [Status]: ${status.toUpperCase()}`
        );

        // Send payload to Express backend endpoint
        const response = await makeRequest(`${SERVER_URL}/api/telemetry`, { method: 'POST' }, telemetryBundle);

        log(
          'green',
          'ACK',
          `Telemetry locked! Server updated Unit cumulative distance. (New ride ID: ${response.id})`
        );
        log('cyan', 'SIMULATOR', '---------------------------------------------------------');
      } catch (err) {
        log('red', 'COMM_ERROR', `Packet drop: ${err.message}`);
      }
    }, 4000); // Send new telemetry bundle every 4 seconds
  } catch (error) {
    log('red', 'FATAL', `Could not link to server: ${error.message}`);
    log('yellow', 'TIP', 'Ensure the backend Express server is running on http://localhost:5000!');
    process.exit(1);
  }
}

// Handle termination gracefully
process.on('SIGINT', () => {
  log('cyan', 'SIMULATOR', 'Shutting down broadcast lines. Offline status broadcasted.');
  process.exit(0);
});

runSimulator();
