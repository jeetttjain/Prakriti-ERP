const biService = require("../services/businessIntelligence.service");
const { successResponse, errorResponse } = require("../services/response.service");
const auditLogService = require("../services/auditLog.service");

// GET /api/bi/overview
exports.getOverview = async (req, res) => {
  try {
    const data = await biService.getBIOverview(req.query);

    if (req.user?.userId) {
      auditLogService.logEvent({
        module: "BusinessIntelligence",
        action: "BI Overview Access",
        performedBy: req.user.userCode || req.user.userId,
        ipAddress: req.ip,
      }).catch(() => {});
    }

    return successResponse(res, data, "BI Overview and Health Score calculated.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/bi/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const data = await biService.getRecommendations(req.query);
    return successResponse(res, data, "Recommendations retrieved successfully.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/bi/sales
exports.getSalesIntelligence = async (req, res) => {
  try {
    const data = await biService.getSalesIntelligence();
    return successResponse(res, data, "Sales Intelligence loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/bi/inventory
exports.getInventoryIntelligence = async (req, res) => {
  try {
    const data = await biService.getInventoryIntelligence();
    return successResponse(res, data, "Inventory Intelligence loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/bi/customers
exports.getCustomerIntelligence = async (req, res) => {
  try {
    const data = await biService.getCustomerIntelligence();
    return successResponse(res, data, "Customer Intelligence loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/bi/suppliers
exports.getSupplierIntelligence = async (req, res) => {
  try {
    const data = await biService.getSupplierIntelligence();
    return successResponse(res, data, "Supplier Intelligence loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/bi/finance
exports.getFinancialIntelligence = async (req, res) => {
  try {
    const data = await biService.getFinancialIntelligence();
    return successResponse(res, data, "Financial Intelligence loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/bi/purchases
exports.getPurchaseIntelligence = async (req, res) => {
  try {
    const data = await biService.getPurchaseIntelligence();
    return successResponse(res, data, "Purchase Intelligence loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/bi/alerts
exports.getAlerts = async (req, res) => {
  try {
    const data = await biService.getAlerts();
    return successResponse(res, data, "BI Alerts retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/bi/health
exports.getHealthScore = async (req, res) => {
  try {
    const overview = await biService.getBIOverview(req.query);
    return successResponse(res, overview.healthScore, "Business Health Score calculated.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/bi/recommendation/:id/resolve
exports.resolveRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const rec = await biService.resolveRecommendation(id, resolutionNotes, req.user?.userCode || req.user?.userId);

    if (req.user?.userId) {
      auditLogService.logEvent({
        module: "BusinessIntelligence",
        action: "Recommendation Resolved",
        performedBy: req.user.userCode || req.user.userId,
        targetId: rec._id.toString(),
        ipAddress: req.ip,
      }).catch(() => {});
    }

    return successResponse(res, rec, "Recommendation resolved successfully.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/bi/recommendation/:id/archive
exports.archiveRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = await biService.archiveRecommendation(id, req.user?.userCode || req.user?.userId);
    return successResponse(res, rec, "Recommendation archived successfully.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
