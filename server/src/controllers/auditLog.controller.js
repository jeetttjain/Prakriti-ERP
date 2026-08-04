const auditLogService = require("../services/auditLog.service");
const { successResponse, errorResponse } = require("../services/response.service");

// GET /api/audit
exports.getAuditLogs = async (req, res) => {
  try {
    const result = await auditLogService.getAuditLogs(req.query);
    return successResponse(res, result, "Audit logs retrieved successfully.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/audit/activity
exports.getAuditStats = async (req, res) => {
  try {
    const stats = await auditLogService.getAuditStats();
    return successResponse(res, stats, "Audit statistics loaded.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/audit/:id
exports.getAuditLogById = async (req, res) => {
  try {
    const log = await auditLogService.getAuditLogById(req.params.id);
    if (!log) {
      return errorResponse(res, "Audit log entry not found.", 404);
    }
    return successResponse(res, log, "Audit details loaded.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/audit/entity/:entity/:id
exports.getEntityHistory = async (req, res) => {
  try {
    const { entity, id } = req.params;
    const history = await auditLogService.getEntityHistory(entity, id);
    return successResponse(res, history, `Transaction history loaded for ${entity}.`);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/audit/user/:userId
exports.getUserActivity = async (req, res) => {
  try {
    const activity = await auditLogService.getUserActivity(req.params.userId);
    return successResponse(res, activity, "User activity history loaded.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/audit/module/:module
exports.getModuleActivity = async (req, res) => {
  try {
    const result = await auditLogService.getAuditLogs({ ...req.query, module: req.params.module });
    return successResponse(res, result, `Module activity loaded for ${req.params.module}.`);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
