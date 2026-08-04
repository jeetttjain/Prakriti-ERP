const AutomationRule = require("../models/AutomationRule");
const AutomationExecution = require("../models/AutomationExecution");
const automationService = require("../services/automation.service");
const schedulerService = require("../services/scheduler.service");
const { queueAdapter } = require("../services/queue.service");
const { generateCounter } = require("../services/counter.service");
const { successResponse, errorResponse } = require("../services/response.service");

// GET /api/automation/rules
exports.getRules = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.module && req.query.module !== "All") filter.module = req.query.module;
    if (req.query.trigger && req.query.trigger !== "All") filter.trigger = req.query.trigger;

    const [rules, totalRecords] = await Promise.all([
      AutomationRule.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AutomationRule.countDocuments(filter),
    ]);

    return successResponse(
      res,
      { items: rules, page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) },
      "Automation rules retrieved successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/automation/rules/:id
exports.getRuleById = async (req, res) => {
  try {
    const rule = await AutomationRule.findById(req.params.id).lean();
    if (!rule) return errorResponse(res, "Automation rule not found.", 404);
    return successResponse(res, rule, "Automation rule loaded.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// POST /api/automation/rules
exports.createRule = async (req, res) => {
  try {
    const ruleNumber = await generateCounter("ruleNumber", "AUT", 6);
    const rule = new AutomationRule({
      ...req.body,
      ruleNumber,
      createdBy: req.user?.name || "Admin",
    });
    await rule.save();
    return successResponse(res, rule, "Automation rule created successfully.", 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// PUT /api/automation/rules/:id
exports.updateRule = async (req, res) => {
  try {
    const rule = await AutomationRule.findById(req.params.id);
    if (!rule) return errorResponse(res, "Automation rule not found.", 404);

    Object.assign(rule, req.body);
    rule.version = (rule.version || 1) + 1;
    rule.publishedAt = new Date();
    rule.updatedBy = req.user?.name || "Admin";

    await rule.save();
    return successResponse(res, rule, "Automation rule updated.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// PATCH /api/automation/rules/:id/toggle
exports.toggleRule = async (req, res) => {
  try {
    const rule = await AutomationRule.findById(req.params.id);
    if (!rule) return errorResponse(res, "Automation rule not found.", 404);

    rule.isEnabled = !rule.isEnabled;
    await rule.save();
    return successResponse(res, rule, `Automation rule ${rule.isEnabled ? "enabled" : "disabled"}.`);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// POST /api/automation/rules/:id/clone
exports.cloneRule = async (req, res) => {
  try {
    const original = await AutomationRule.findById(req.params.id).lean();
    if (!original) return errorResponse(res, "Automation rule not found.", 404);

    const ruleNumber = await generateCounter("ruleNumber", "AUT", 6);
    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;

    const cloned = new AutomationRule({
      ...original,
      ruleNumber,
      name: `${original.name} (Copy)`,
      version: 1,
      executionCount: 0,
      failureCount: 0,
      createdBy: req.user?.name || "Admin",
    });
    await cloned.save();
    return successResponse(res, cloned, "Automation rule cloned.", 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// DELETE /api/automation/rules/:id
exports.deleteRule = async (req, res) => {
  try {
    await AutomationRule.findByIdAndDelete(req.params.id);
    return successResponse(res, null, "Automation rule deleted.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// POST /api/automation/rules/:id/run
exports.runRuleManual = async (req, res) => {
  try {
    const rule = await AutomationRule.findById(req.params.id).lean();
    if (!rule) return errorResponse(res, "Automation rule not found.", 404);

    await automationService.enqueueExecution(rule, { manualRunBy: req.user?.name || "Admin" }, `MANUAL-${Date.now()}`, "MANUAL");
    return successResponse(res, null, `Manual run queued for rule ${rule.name}.`);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/automation/executions
exports.getExecutions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== "All") filter.status = req.query.status;

    const [executions, totalRecords] = await Promise.all([
      AutomationExecution.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AutomationExecution.countDocuments(filter),
    ]);

    return successResponse(
      res,
      { items: executions, page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) },
      "Executions retrieved."
    );
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/automation/executions/:id
exports.getExecutionById = async (req, res) => {
  try {
    const execution = await AutomationExecution.findById(req.params.id).lean();
    if (!execution) return errorResponse(res, "Execution record not found.", 404);
    return successResponse(res, execution, "Execution record loaded.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// POST /api/automation/executions/:id/retry
exports.retryExecution = async (req, res) => {
  try {
    const result = await automationService.retryExecution(req.params.id);
    return successResponse(res, result, "Job queued for retry.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/automation/stats
exports.getStats = async (req, res) => {
  try {
    const [totalRules, activeRules, totalExecutions, failedExecutions] = await Promise.all([
      AutomationRule.countDocuments({}),
      AutomationRule.countDocuments({ isEnabled: true }),
      AutomationExecution.countDocuments({}),
      AutomationExecution.countDocuments({ status: { $in: ["FAILED", "FAILED_PERMANENT"] } }),
    ]);

    return successResponse(
      res,
      { totalRules, activeRules, totalExecutions, failedExecutions },
      "Automation stats loaded."
    );
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/automation/health
exports.getHealth = async (req, res) => {
  try {
    const queueHealth = queueAdapter.getHealth();
    const schedulerHealth = schedulerService.getStatus();
    return successResponse(res, { queue: queueHealth, scheduler: schedulerHealth }, "Automation health status.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/automation/scheduler
exports.getSchedulerStatus = async (req, res) => {
  return successResponse(res, schedulerService.getStatus(), "Scheduler status.");
};

// POST /api/automation/scheduler/pause
exports.pauseScheduler = async (req, res) => {
  return successResponse(res, schedulerService.pause(), "Scheduler paused.");
};

// POST /api/automation/scheduler/resume
exports.resumeScheduler = async (req, res) => {
  return successResponse(res, schedulerService.resume(), "Scheduler resumed.");
};
