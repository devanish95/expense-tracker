const mongoose = require('mongoose');

let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // Connection already being established
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    .then((mongooseInstance) => {
      cachedConnection = mongooseInstance;

      console.log(
        `✓ MongoDB Connected: ${mongooseInstance.connection.host}`
      );

      return mongooseInstance;
    })
    .catch((error) => {
      connectionPromise = null;

      console.error(
        `✗ MongoDB Connection Error: ${error.message}`
      );

      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;