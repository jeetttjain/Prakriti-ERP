const SystemSnapshot = require("../models/SystemSnapshot");
const SystemTimeline = require("../models/SystemTimeline");
const moduleRegistry = require("../core/system-control/modules/moduleRegistry");
const systemControlEngine = require("../core/system-control/runtime/systemControlEngine");
const featureFlagEngine = require("../core/system-control/featureflags/featureFlagEngine");
const configEngine = require("../core/system-control/configuration/configEngine");
const maintenanceEngine = require("../core/system-control/maintenance/maintenanceEngine");
const snapshotEngine = require("../core/system-control/snapshots/snapshotEngine");
const emergencyControl = require("../core/system-control/emergency/emergencyControl");
const { successResponse, errorResponse } = require("../services/response.service");

// GET /api/system/modules
exports.getModules = async (req, res) => {
  try {
    const modules = await moduleRegistry.listModules();
    return successResponse(res, modules, "System modules retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/system/services
exports.getServices = async (req, res) => {
  try {
    const modules = await moduleRegistry.listModules();
    return successResponse(res, modules, "Service groups retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/system/flags
exports.getFlags = async (req, res) => {
  try {
    const flags = await featureFlagEngine.listFlags();
    return successResponse(res, flags, "Feature flags retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/system/configuration
exports.getConfigurations = async (req, res) => {
  try {
    const configs = await configEngine.listConfigs();
    return successResponse(res, configs, "System configurations retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/system/maintenance
exports.getMaintenance = async (req, res) => {
  try {
    const maintenance = await maintenanceEngine.getActiveMaintenance();
    return successResponse(res, maintenance, "Active maintenance windows retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/system/snapshots
exports.getSnapshots = async (req, res) => {
  try {
    const snapshots = await SystemSnapshot.find({}).sort({ createdAt: -1 });
    return successResponse(res, snapshots, "System snapshots retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/system/timeline
exports.getTimeline = async (req, res) => {
  try {
    const timeline = await SystemTimeline.find({}).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, timeline, "System operational timeline retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/system/module/start
exports.startModule = async (req, res) => {
  try {
    const mod = await systemControlEngine.startModule(req.body.moduleId, req.user?.userCode || "ADMIN-01");
    return successResponse(res, mod, "Module started.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/system/module/stop
exports.stopModule = async (req, res) => {
  try {
    const { moduleId, force } = req.body;
    const mod = await systemControlEngine.stopModule(moduleId, force, req.user?.userCode || "ADMIN-01");
    return successResponse(res, mod, "Module stopped.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/system/module/restart
exports.restartModule = async (req, res) => {
  try {
    const mod = await systemControlEngine.restartModule(req.body.moduleId, req.user?.userCode || "ADMIN-01");
    return successResponse(res, mod, "Module restarted.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/system/feature/enable
exports.enableFeature = async (req, res) => {
  try {
    const flag = await featureFlagEngine.setFlag(req.body.key, true, req.user?.userCode || "ADMIN-01");
    return successResponse(res, flag, "Feature flag enabled.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/system/feature/disable
exports.disableFeature = async (req, res) => {
  try {
    const flag = await featureFlagEngine.setFlag(req.body.key, false, req.user?.userCode || "ADMIN-01");
    return successResponse(res, flag, "Feature flag disabled.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/system/maintenance/start
exports.startMaintenance = async (req, res) => {
  try {
    const { bannerMessage, mode } = req.body;
    const m = await maintenanceEngine.startMaintenance(bannerMessage, mode, req.user?.userCode || "ADMIN-01");
    return successResponse(res, m, "Maintenance mode activated.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/system/maintenance/stop
exports.stopMaintenance = async (req, res) => {
  try {
    const m = await maintenanceEngine.stopMaintenance(req.body.maintenanceId, req.user?.userCode || "ADMIN-01");
    return successResponse(res, m, "Maintenance mode stopped.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/system/snapshot/create
exports.createSnapshot = async (req, res) => {
  try {
    const snap = await snapshotEngine.createSnapshot(req.body.description || "System State Backup", req.user?.userCode || "ADMIN-01");
    return successResponse(res, snap, "System snapshot captured.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/system/snapshot/restore
exports.restoreSnapshot = async (req, res) => {
  try {
    const snap = await snapshotEngine.restoreSnapshot(req.body.snapshotId, req.user?.userCode || "ADMIN-01");
    return successResponse(res, snap, "System snapshot restored.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/system/configuration
exports.updateConfiguration = async (req, res) => {
  try {
    const { configKey, value } = req.body;
    const cfg = await configEngine.updateConfig(configKey, value, req.user?.userCode || "ADMIN-01");
    return successResponse(res, cfg, "Configuration updated.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/system/emergency
exports.triggerEmergency = async (req, res) => {
  try {
    const result = await emergencyControl.triggerEmergencyAction(req.body.target || "AUTOMATION_STOP", req.user?.userCode || "ADMIN-01");
    return successResponse(res, result, "Emergency control action executed.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
