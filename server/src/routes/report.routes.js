const express = require("express");
const router = express.Router();
const {
  // Legacy Report Controller Handlers
  getDashboardSummary,
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getCustomerReport,
  getSupplierReport,
  getPaymentReport,
  getOutstandingReport,
  getProductPerformanceReport,

  // Phase 2 Enterprise Reports & Analytics Handlers
  getSalesSummaryAnalytics,
  getTopProductsAnalytics,
  getTopCustomersAnalytics,
  getPurchaseSummaryAnalytics,
  getTopSuppliersAnalytics,
  getInventorySummaryAnalytics,
  getStockMovementAnalytics,
  getReceivablesAnalytics,
  getPayablesAnalytics,
  getPaymentSummaryAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getSupplierAnalytics,
} = require("../controllers/report.controller");

// Legacy Routes (Backward Compatibility)
router.get("/dashboard-summary", getDashboardSummary);
router.get("/sales", getSalesReport);
router.get("/purchases", getPurchaseReport);
router.get("/inventory", getInventoryReport);
router.get("/customers", getCustomerReport);
router.get("/suppliers", getSupplierReport);
router.get("/payments", getPaymentReport);
router.get("/outstanding", getOutstandingReport);
router.get("/products", getProductPerformanceReport);

// Phase 2 Enterprise Sales Reports
router.get("/sales-summary", getSalesSummaryAnalytics);
router.get("/top-products", getTopProductsAnalytics);
router.get("/top-customers", getTopCustomersAnalytics);

// Phase 2 Enterprise Purchase Reports
router.get("/purchase-summary", getPurchaseSummaryAnalytics);
router.get("/top-suppliers", getTopSuppliersAnalytics);

// Phase 2 Enterprise Inventory Reports
router.get("/inventory-summary", getInventorySummaryAnalytics);
router.get("/stock-movement", getStockMovementAnalytics);

// Phase 2 Enterprise Financial Reports
router.get("/receivables", getReceivablesAnalytics);
router.get("/payables", getPayablesAnalytics);
router.get("/payment-summary", getPaymentSummaryAnalytics);

// Phase 2 Enterprise Customer Analytics
router.get("/customer-analytics", getCustomerAnalytics);

// Phase 2 Enterprise Product Analytics
router.get("/product-analytics", getProductAnalytics);

// Phase 2 Enterprise Supplier Analytics
router.get("/supplier-analytics", getSupplierAnalytics);

module.exports = router;
