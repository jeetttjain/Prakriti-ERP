const express = require("express");
const router = express.Router();
const {
  getRules,
  getRuleById,
  createRule,
  updateRule,
  toggleRule,
  cloneRule,
  deleteRule,
  runRuleManual,
  getExecutions,
  getExecutionById,
  retryExecution,
  getStats,
  getHealth,
  getSchedulerStatus,
  pauseScheduler,
  resumeScheduler,
} = require("../controllers/automation.controller");

const { authenticate } = require("../middlewares/auth.middleware");

// Enforce authentication
router.use(authenticate);

// Health & Stats
router.get("/health", getHealth);
router.get("/stats", getStats);
router.get("/scheduler", getSchedulerStatus);
router.post("/scheduler/pause", pauseScheduler);
router.post("/scheduler/resume", resumeScheduler);

// Rules Endpoints
router.get("/rules", getRules);
router.get("/rules/:id", getRuleById);
router.post("/rules", createRule);
router.put("/rules/:id", updateRule);
router.patch("/rules/:id/toggle", toggleRule);
router.post("/rules/:id/clone", cloneRule);
router.delete("/rules/:id", deleteRule);
router.post("/rules/:id/run", runRuleManual);

// Executions Endpoints
router.get("/executions", getExecutions);
router.get("/executions/:id", getExecutionById);
router.post("/executions/:id/retry", retryExecution);

module.exports = router;
