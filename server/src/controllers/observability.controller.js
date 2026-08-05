const SystemLog = require("../models/SystemLog");
const SystemMetric = require("../models/SystemMetric");
const TraceSpan = require("../models/TraceSpan");
const SystemAlert = require("../models/SystemAlert");
const ObservabilityPolicy = require("../models/ObservabilityPolicy");
const telemetryPipeline = require("../core/observability/telemetry/telemetryPipeline");
const diagnosticsEngine = require("../core/observability/diagnostics/diagnosticsEngine");
const alertEngine = require("../core/observability/alerts/alertEngine");
const performanceProfiler = require("../core/observability/profiling/performanceProfiler");
const { successResponse, errorResponse } = require("../services/response.service");

// GET /api/observability/logs
exports.getLogs = async (req, res) => {
  try {
    const logs = await SystemLog.find({}).sort({ createdAt: -1 }).limit(100);
    return successResponse(res, logs, "Telemetry logs retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/observability/metrics
exports.getMetrics = async (req, res) => {
  try {
    const metrics = await telemetryPipeline.getMetrics();
    return successResponse(res, metrics, "System metrics collected.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/observability/traces
exports.getTraces = async (req, res) => {
  try {
    const traces = await TraceSpan.find({}).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, traces, "Distributed traces retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/observability/health
exports.getHealth = async (req, res) => {
  try {
    const health = await telemetryPipeline.getHealth();
    return successResponse(res, health, "System health retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/observability/alerts
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await SystemAlert.find({}).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, alerts, "System alerts retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/observability/diagnostics
exports.getDiagnostics = async (req, res) => {
  try {
    const report = await diagnosticsEngine.runDiagnostics(req.user?.userCode || "Admin");
    return successResponse(res, report, "Diagnostics completed.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/observability/performance
exports.getPerformance = async (req, res) => {
  try {
    const report = await performanceProfiler.getPerformanceReport();
    return successResponse(res, report, "Performance profiler report generated.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/observability/diagnostics/run
exports.runDiagnostics = async (req, res) => {
  try {
    const report = await diagnosticsEngine.runDiagnostics(req.user?.userCode || "Admin");
    return successResponse(res, report, "Diagnostic test run executed.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/observability/alerts/acknowledge
exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await alertEngine.acknowledgeAlert(req.body.alertId, req.user?.userCode || "Admin");
    return successResponse(res, alert, "Alert acknowledged.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/observability/retention
exports.updateRetention = async (req, res) => {
  try {
    const policy = await ObservabilityPolicy.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    return successResponse(res, policy, "Retention policy updated.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// DELETE /api/observability/logs
exports.clearLogs = async (req, res) => {
  try {
    await SystemLog.deleteMany({});
    return successResponse(res, null, "Telemetry logs cleared.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
