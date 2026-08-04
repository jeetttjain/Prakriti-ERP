const reportService = require("../services/report.service");
const { successResponse, errorResponse } = require("../services/response.service");

// OVERVIEW SUMMARY
exports.getOverview = async (req, res) => {
  try {
    const data = await reportService.getDashboardSummary(req.query, req.body?.user || "System");
    return successResponse(res, {
      totalCustomers: data.summary?.totalCustomers || 0,
      activeCustomers: data.summary?.activeCustomers || 0,
      totalSuppliers: data.summary?.totalSuppliers || 0,
      totalProducts: data.summary?.totalProducts || 0,
      totalInventoryItems: data.summary?.totalInventoryItems || 0,
      totalOrders: data.summary?.totalOrders || 0,
      pendingOrders: data.summary?.pendingOrders || 0,
      deliveredOrders: data.summary?.deliveredOrders || 0,
      totalPurchases: data.summary?.totalPurchases || 0,
    });
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// FINANCIAL KPIS
exports.getKPIs = async (req, res) => {
  try {
    const data = await reportService.getDashboardSummary(req.query, req.body?.user || "System");
    return successResponse(res, {
      revenue: data.summary?.totalRevenue || 0,
      collections: data.summary?.totalPaymentsReceived || 0,
      outstanding: data.summary?.outstandingInvoices || 0,
      inventoryValue: data.summary?.currentInventoryValue || 0,
    });
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// TREND CHARTS
exports.getCharts = async (req, res) => {
  try {
    const salesReport = await reportService.getSalesReport({ rangeType: "Month" }, req.body?.user || "System");
    const purchaseReport = await reportService.getPurchaseReport({ rangeType: "Month" }, req.body?.user || "System");

    return successResponse(res, {
      salesTrend: salesReport.charts?.monthlyTrend || [],
      purchaseTrend: purchaseReport.charts?.purchaseTrend || [],
      revenueByMethod: salesReport.charts?.dailyTrend || [],
    });
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// RECENT ACTIVITIES
exports.getActivity = async (req, res) => {
  try {
    const salesReport = await reportService.getSalesReport({ rangeType: "Week" }, req.body?.user || "System");
    const purchaseReport = await reportService.getPurchaseReport({ rangeType: "Week" }, req.body?.user || "System");
    const paymentReport = await reportService.getPaymentReport({ rangeType: "Week" }, req.body?.user || "System");

    return successResponse(res, {
      recentOrders: (salesReport.tables?.ordersList || []).slice(0, 5),
      recentPurchases: (purchaseReport.tables?.productWise || []).slice(0, 5),
      recentPayments: (paymentReport.tables?.paymentsList || []).slice(0, 5),
    });
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// ALERTS & NOTIFICATIONS
exports.getAlerts = async (req, res) => {
  try {
    const inventoryReport = await reportService.getInventoryReport({}, req.body?.user || "System");
    const outstandingReport = await reportService.getOutstandingReport({}, req.body?.user || "System");

    return successResponse(res, {
      lowStock: (inventoryReport.tables?.lowStock || []).slice(0, 5),
      outOfStock: (inventoryReport.tables?.outOfStock || []).slice(0, 5),
      overduePayments: (outstandingReport.tables?.outstandingInvoices || []).slice(0, 5),
    });
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
