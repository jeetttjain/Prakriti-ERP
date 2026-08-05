const express = require("express");
const router = express.Router();
const {
  getOverview,
  getKPIs,
  getCharts,
  getActivity,
  getAlerts,
  getHealth,
  getPreferences,
  updatePreferences,
  clearCache,
} = require("../controllers/dashboard.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// Require Authentication on all Executive Analytics routes
router.use(authenticate);

router.get("/overview", getOverview);
router.get("/kpis", getKPIs);
router.get("/charts", getCharts);
router.get("/activity", getActivity);
router.get("/alerts", getAlerts);
router.get("/health", getHealth);

// Personalization endpoints
router.get("/preferences", getPreferences);
router.put("/preferences", updatePreferences);

// Manual Cache Clear endpoint
router.post("/cache/clear", clearCache);

module.exports = router;
