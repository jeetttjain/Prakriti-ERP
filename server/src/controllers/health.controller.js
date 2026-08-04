const mongoose = require("mongoose");
const os = require("os");
const { queueAdapter } = require("../services/queue.service");
const schedulerService = require("../services/scheduler.service");
const { successResponse, errorResponse } = require("../services/response.service");

// Public Liveness Probe: GET /health
exports.getLiveness = (req, res) => {
  return res.status(200).json({
    status: "UP",
    version: "1.0.0",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date(),
  });
};

// Public Readiness Probe: GET /ready
exports.getReadiness = (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  const schedulerStatus = schedulerService.getStatus();
  const queueHealth = queueAdapter.getHealth();

  const isReady = mongoConnected && !schedulerStatus.isPaused;

  if (!isReady) {
    return res.status(503).json({
      status: "NOT_READY",
      mongoConnected,
      schedulerActive: !schedulerStatus.isPaused,
      message: "Server dependencies are initializing or degraded.",
    });
  }

  return res.status(200).json({
    status: "READY",
    mongoConnected: true,
    schedulerActive: true,
    activeWorkers: queueHealth.runningJobs,
    pendingJobs: queueHealth.pendingJobs,
    timestamp: new Date(),
  });
};

// Private Admin Endpoints:
exports.getDatabaseHealth = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    const pingStart = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingMs = Date.now() - pingStart;

    const collections = await mongoose.connection.db.listCollections().toArray();

    return successResponse(res, {
      status: states[dbState] || "Unknown",
      dbName: mongoose.connection.name,
      pingMs,
      totalCollections: collections.length,
    }, "Database health status loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getCacheHealth = (req, res) => {
  return successResponse(res, queueAdapter.getHealth(), "Queue and Cache health status loaded.");
};

exports.getStorageHealth = (req, res) => {
  return successResponse(res, {
    storageProvider: process.env.CLOUDINARY_CLOUD_NAME ? "Cloudinary + Local Static" : "Local Disk Storage",
    status: "HEALTHY",
  }, "Storage health status loaded.");
};

exports.getSystemHealth = (req, res) => {
  const memory = process.memoryUsage();
  return successResponse(res, {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
    freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
    processRssMB: Math.round(memory.rss / 1024 / 1024),
    processHeapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
    processHeapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
    cpuCores: os.cpus().length,
    uptimeSeconds: Math.floor(process.uptime()),
  }, "System health metrics loaded.");
};

exports.getVersionHealth = (req, res) => {
  return successResponse(res, {
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
    buildTime: new Date().toISOString(),
  }, "Version health info loaded.");
};
