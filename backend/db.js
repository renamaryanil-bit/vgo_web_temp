const mongoose = require('mongoose');
require('dotenv').config();

let mongoServer;

async function connectDB() {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = new MongoMemoryServer();
      await mongoServer.start();
      uri = mongoServer.getUri();
      console.log('\x1b[36m[DB]\x1b[0m Using in-memory MongoDB');
      console.log(`\x1b[36m[DB]\x1b[0m URI: ${uri}`);
    } else {
      console.log('\x1b[36m[DB]\x1b[0m Connecting to MongoDB:', uri);
    }

    await mongoose.connect(uri);
    console.log('\x1b[32m[DB]\x1b[0m Connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('\x1b[31m[DB]\x1b[0m Connection failed:', error.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
