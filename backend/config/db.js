const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    console.log('Tip: Ensure MongoDB is running locally or check your MONGODB_URI in .env');
    // We don't exit immediately in development so the user can see helpful errors
  }
};

module.exports = connectDB;

