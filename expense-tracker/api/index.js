const app = require("../backend/server");
const connectDB = require("../backend/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();

    return app(req, res);
  } catch (error) {
    console.error("Vercel API error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Database connection failed"
    });
  }
};