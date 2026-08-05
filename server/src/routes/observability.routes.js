const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/observability.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/logs", ctrl.getLogs);
router.get("/metrics", ctrl.getMetrics);
router.get("/traces", ctrl.getTraces);
router.get("/health", ctrl.getHealth);
router.get("/alerts", ctrl.getAlerts);
router.get("/diagnostics", ctrl.getDiagnostics);
router.get("/performance", ctrl.getPerformance);

router.post("/diagnostics/run", ctrl.runDiagnostics);
router.post("/alerts/acknowledge", ctrl.acknowledgeAlert);
router.patch("/retention", ctrl.updateRetention);
router.delete("/logs", ctrl.clearLogs);

module.exports = router;
