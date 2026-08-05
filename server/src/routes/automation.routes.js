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

const coreCtrl = require("../controllers/automationCore.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Enforce authentication
router.use(authenticate);

// Legacy Health & Rules
router.get("/health", getHealth);
router.get("/stats", getStats);
router.get("/scheduler", getSchedulerStatus);
router.post("/scheduler/pause", pauseScheduler);
router.post("/scheduler/resume", resumeScheduler);

router.get("/rules", getRules);
router.get("/rules/:id", getRuleById);
router.post("/rules", createRule);
router.put("/rules/:id", updateRule);
router.patch("/rules/:id/toggle", toggleRule);
router.post("/rules/:id/clone", cloneRule);
router.delete("/rules/:id", deleteRule);
router.post("/rules/:id/run", runRuleManual);

router.get("/executions", getExecutions);
router.get("/executions/:id", getExecutionById);
router.post("/executions/:id/retry", retryExecution);

// Phase 7.3A Enterprise Automation Core REST APIs
router.get("/events", coreCtrl.getEvents);
router.post("/events/replay", coreCtrl.replayEvents);
router.get("/jobs", coreCtrl.getJobs);
router.get("/history", coreCtrl.getHistory);
router.get("/workflows", coreCtrl.getWorkflows);
router.get("/templates", coreCtrl.getTemplates);
router.get("/metrics", coreCtrl.getMetrics);

router.post("/event", coreCtrl.publishEvent);
router.post("/job", coreCtrl.createJob);
router.post("/workflow", coreCtrl.createWorkflow);

router.patch("/job/:id/pause", coreCtrl.pauseJob);
router.patch("/job/:id/resume", coreCtrl.resumeJob);
router.patch("/job/:id/retry", coreCtrl.retryJob);
router.patch("/job/:id/cancel", coreCtrl.cancelJob);
router.delete("/job/:id", coreCtrl.deleteJob);

module.exports = router;
