require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./src/app");
const connectDB = require("./src/config/database");
const { validateEnvironment } = require("./src/config/envValidator");
const schedulerService = require("./src/services/scheduler.service");

// Boot Check: Validate Environment Variables
validateEnvironment();

const PORT = process.env.PORT || 5000;

// Connect Database & Startup Verification
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`
==========================================
🌿 Prakriti ERP & Customer Portal API
🚀 Server Running & Healthy
📍 Listening on http://localhost:${PORT}
==========================================
`);
  });

  // Graceful Shutdown Signal Handlers (SIGINT / SIGTERM)
  const handleGracefulShutdown = (signal) => {
    console.log(`\n🛑 [Graceful Shutdown] Received ${signal}. Draining queue and cleaning resources...`);

    // Pause background scheduler
    schedulerService.pause();

    server.close(async () => {
      console.log("🔒 [Graceful Shutdown] HTTP Server closed.");

      try {
        await mongoose.connection.close(false);
        console.log("🍃 [Graceful Shutdown] MongoDB connection closed safely.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });

    // Force exit if cleanup hangs for >10s
    setTimeout(() => {
      console.error("⚠️ [Graceful Shutdown] Forced exit timeout exceeded (10s).");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
});