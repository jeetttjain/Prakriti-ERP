const express = require("express");
const router = express.Router();
const {
  getOverview,
  getKPIs,
  getCharts,
  getActivity,
  getAlerts,
} = require("../controllers/dashboard.controller");

router.get("/overview", getOverview);
router.get("/kpis", getKPIs);
router.get("/charts", getCharts);
router.get("/activity", getActivity);
router.get("/alerts", getAlerts);

module.exports = router;
