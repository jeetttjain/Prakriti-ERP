const dashboardService = require("../services/dashboard.service");
const kpiService = require("../services/kpi.service");
const { successResponse, errorResponse } = require("../services/response.service");
const auditLogService = require("../services/auditLog.service");

// OVERVIEW SUMMARY
exports.getOverview = async (req, res) => {
  try {
    const data = await dashboardService.getOverviewData(req.query);
    
    // Audit log access silently
    if (req.user?.userId) {
      auditLogService.logEvent({
        module: "Dashboard",
        action: "Executive Dashboard Access",
        performedBy: req.user.userCode || req.user.userId,
        ipAddress: req.ip,
      }).catch(() => {});
    }

    return successResponse(res, data, "Overview data loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// FINANCIAL KPIS
exports.getKPIs = async (req, res) => {
  try {
    const data = await kpiService.calculateKPIs(req.query);
    return successResponse(res, data, "Financial KPIs calculated successfully.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// TREND CHARTS
exports.getCharts = async (req, res) => {
  try {
    const data = await dashboardService.getChartsData(req.query);
    return successResponse(res, data, "Analytics trend charts loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// RECENT ACTIVITIES
exports.getActivity = async (req, res) => {
  try {
    const data = await dashboardService.getActivityData();
    return successResponse(res, data, "Activity timeline loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ALERTS & NOTIFICATIONS
exports.getAlerts = async (req, res) => {
  try {
    const data = await dashboardService.getAlertsData();
    return successResponse(res, data, "System alerts loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// SYSTEM HEALTH STATUS
exports.getHealth = async (req, res) => {
  try {
    const data = await dashboardService.getHealthData();
    return successResponse(res, data, "System health status loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// USER PREFERENCES CRUD
exports.getPreferences = async (req, res) => {
  try {
    const data = await dashboardService.getUserPreferences(req.user.userId);
    return successResponse(res, data, "Dashboard preferences loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const data = await dashboardService.updateUserPreferences(req.user.userId, req.body);
    return successResponse(res, data, "Dashboard preferences updated successfully.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// CLEAR ANALYTICS CACHE
exports.clearCache = async (req, res) => {
  try {
    const result = dashboardService.clearAnalyticsCache();
    return successResponse(res, result, "Analytics cache flushed.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
