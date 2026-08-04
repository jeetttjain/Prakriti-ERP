const reportService = require("../services/report.service");
const reportAnalyticsService = require("../services/reportAnalytics.service");
const { successResponse, errorResponse } = require("../services/response.service");

// LEGACY DASHBOARD SUMMARY
exports.getDashboardSummary = async (req, res) => {
  try {
    const report = await reportService.getDashboardSummary(req.query, req.body?.user || "System");
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// LEGACY SALES REPORT
exports.getSalesReport = async (req, res) => {
  try {
    const report = await reportService.getSalesReport(req.query, req.body?.user || "System");
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// LEGACY PURCHASE REPORT
exports.getPurchaseReport = async (req, res) => {
  try {
    const report = await reportService.getPurchaseReport(req.query, req.body?.user || "System");
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// LEGACY INVENTORY REPORT
exports.getInventoryReport = async (req, res) => {
  try {
    const report = await reportService.getInventoryReport(req.query, req.body?.user || "System");
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// LEGACY CUSTOMER REPORT
exports.getCustomerReport = async (req, res) => {
  try {
    const report = await reportService.getCustomerReport(req.query, req.body?.user || "System");
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// LEGACY SUPPLIER REPORT
exports.getSupplierReport = async (req, res) => {
  try {
    const report = await reportService.getSupplierReport(req.query, req.body?.user || "System");
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// LEGACY PAYMENT REPORT
exports.getPaymentReport = async (req, res) => {
  try {
    const report = await reportService.getPaymentReport(req.query, req.body?.user || "System");
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// LEGACY OUTSTANDING REPORT
exports.getOutstandingReport = async (req, res) => {
  try {
    const report = await reportService.getOutstandingReport(req.query, req.body?.user || "System");
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// LEGACY PRODUCT PERFORMANCE REPORT
exports.getProductPerformanceReport = async (req, res) => {
  try {
    const report = await reportService.getProductPerformanceReport(req.query, req.body?.user || "System");
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// ==========================================
// PHASE 2 ENTERPRISE REPORTING & ANALYTICS
// ==========================================

// 1. Sales Summary
exports.getSalesSummaryAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getSalesSummary(req.query);
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 2. Top Products
exports.getTopProductsAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getTopProducts(req.query);
    return res.status(200).json(report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 3. Top Customers
exports.getTopCustomersAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getTopCustomers(req.query);
    return res.status(200).json(report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 4. Purchase Summary
exports.getPurchaseSummaryAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getPurchaseSummary(req.query);
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 5. Top Suppliers
exports.getTopSuppliersAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getTopSuppliers(req.query);
    return res.status(200).json(report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 6. Inventory Summary
exports.getInventorySummaryAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getInventorySummary(req.query);
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 7. Stock Movement
exports.getStockMovementAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getStockMovement(req.query);
    return res.status(200).json(report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 8. Receivables (Financial Report)
exports.getReceivablesAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getReceivables(req.query);
    return res.status(200).json(report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 9. Payables (Financial Report)
exports.getPayablesAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getPayables(req.query);
    return res.status(200).json(report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 10. Payment Summary (Financial Report)
exports.getPaymentSummaryAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getPaymentSummary(req.query);
    return res.status(200).json(report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 11. Customer Analytics
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getCustomerAnalytics(req.query);
    return res.status(200).json(report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 12. Product Analytics
exports.getProductAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getProductAnalytics(req.query);
    return res.status(200).json(report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// 13. Supplier Analytics
exports.getSupplierAnalytics = async (req, res) => {
  try {
    const report = await reportAnalyticsService.getSupplierAnalytics(req.query);
    return res.status(200).json(report);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
