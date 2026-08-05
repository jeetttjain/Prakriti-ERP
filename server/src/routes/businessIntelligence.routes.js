const express = require("express");
const router = express.Router();
const {
  getOverview,
  getRecommendations,
  getSalesIntelligence,
  getInventoryIntelligence,
  getCustomerIntelligence,
  getSupplierIntelligence,
  getFinancialIntelligence,
  getPurchaseIntelligence,
  getAlerts,
  getHealthScore,
  resolveRecommendation,
  archiveRecommendation,
} = require("../controllers/businessIntelligence.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Require JWT authentication on all BI endpoints
router.use(authenticate);

router.get("/overview", getOverview);
router.get("/recommendations", getRecommendations);
router.get("/sales", getSalesIntelligence);
router.get("/inventory", getInventoryIntelligence);
router.get("/customers", getCustomerIntelligence);
router.get("/suppliers", getSupplierIntelligence);
router.get("/finance", getFinancialIntelligence);
router.get("/purchases", getPurchaseIntelligence);
router.get("/alerts", getAlerts);
router.get("/health", getHealthScore);

// Recommendation Lifecycle Management
router.post("/recommendation/:id/resolve", resolveRecommendation);
router.post("/recommendation/:id/archive", archiveRecommendation);

module.exports = router;
