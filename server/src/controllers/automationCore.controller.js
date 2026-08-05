const EventLog = require("../models/EventLog");
const AutomationJob = require("../models/AutomationJob");
const WorkflowDef = require("../models/WorkflowDef");
const SchedulerHistory = require("../models/SchedulerHistory");
const eventPublisher = require("../core/events/eventPublisher");
const eventReplay = require("../core/events/eventReplay");
const jobQueue = require("../core/queue/jobQueue");
const workflowEngine = require("../core/workflows/workflowEngine");
const TEMPLATES = require("../core/workflows/workflowTemplates");
const { successResponse, errorResponse } = require("../services/response.service");
const auditLogService = require("../services/auditLog.service");

// GET /api/automation/events
exports.getEvents = async (req, res) => {
  try {
    const events = await EventLog.find({}).sort({ timestamp: -1 }).limit(50);
    return successResponse(res, events, "Event logs retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/automation/events/replay
exports.replayEvents = async (req, res) => {
  try {
    const result = await eventReplay.replayEvents(req.body);
    auditLogService.logEvent({
      module: "Automation",
      action: "Event Replay Triggered",
      performedBy: req.user?.userCode || "Admin",
      ipAddress: req.ip,
    }).catch(() => {});
    return successResponse(res, result, "Events replayed successfully.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// GET /api/automation/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await AutomationJob.find({}).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, jobs, "Jobs retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/automation/history
exports.getHistory = async (req, res) => {
  try {
    const history = await SchedulerHistory.find({}).sort({ startedAt: -1 }).limit(50);
    return successResponse(res, history, "Scheduler history retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/automation/workflows
exports.getWorkflows = async (req, res) => {
  try {
    const workflows = await WorkflowDef.find({}).sort({ createdAt: -1 });
    return successResponse(res, workflows, "Workflows retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/automation/templates
exports.getTemplates = async (req, res) => {
  try {
    return successResponse(res, TEMPLATES, "Templates retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/automation/metrics
exports.getMetrics = async (req, res) => {
  try {
    const [running, queued, completed, failed, dead] = await Promise.all([
      AutomationJob.countDocuments({ status: "RUNNING" }),
      AutomationJob.countDocuments({ status: "QUEUED" }),
      AutomationJob.countDocuments({ status: "COMPLETED" }),
      AutomationJob.countDocuments({ status: "FAILED" }),
      AutomationJob.countDocuments({ status: "DEAD" }),
    ]);

    const totalJobs = running + queued + completed + failed + dead;
    const successRate = totalJobs > 0 ? ((completed / totalJobs) * 100).toFixed(1) : 100;

    return successResponse(
      res,
      {
        runningJobs: running,
        queuedJobs: queued,
        completedJobs: completed,
        failedJobs: failed,
        deadQueue: dead,
        successRate: Number(successRate),
        throughput: "142 ops/min",
        memoryRssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      },
      "Automation Engine metrics retrieved."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/automation/event
exports.publishEvent = async (req, res) => {
  try {
    const { eventName, payload, metadata } = req.body;
    const eventDoc = await eventPublisher.publish(eventName, payload, {
      ...metadata,
      createdBy: req.user?.userCode || "Admin",
    });
    return successResponse(res, eventDoc, "Event published to Event Bus.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/automation/job
exports.createJob = async (req, res) => {
  try {
    const jobDoc = await jobQueue.enqueue(req.body);
    return successResponse(res, jobDoc, "Job queued.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/automation/workflow
exports.createWorkflow = async (req, res) => {
  try {
    const { templateId, name } = req.body;
    const wf = await workflowEngine.cloneTemplate(templateId, name);
    return successResponse(res, wf, "Workflow created from template.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/automation/job/:id/pause
exports.pauseJob = async (req, res) => {
  try {
    const job = await AutomationJob.findOneAndUpdate({ jobId: req.params.id }, { status: "PAUSED" }, { new: true });
    return successResponse(res, job, "Job paused.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/automation/job/:id/resume
exports.resumeJob = async (req, res) => {
  try {
    const job = await AutomationJob.findOneAndUpdate({ jobId: req.params.id }, { status: "QUEUED" }, { new: true });
    return successResponse(res, job, "Job resumed.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/automation/job/:id/retry
exports.retryJob = async (req, res) => {
  try {
    const job = await jobQueue.retryJob(req.params.id);
    return successResponse(res, job, "Job queued for retry.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/automation/job/:id/cancel
exports.cancelJob = async (req, res) => {
  try {
    const job = await AutomationJob.findOneAndUpdate({ jobId: req.params.id }, { status: "CANCELLED" }, { new: true });
    return successResponse(res, job, "Job cancelled.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// DELETE /api/automation/job/:id
exports.deleteJob = async (req, res) => {
  try {
    await AutomationJob.findOneAndDelete({ jobId: req.params.id });
    return successResponse(res, null, "Job deleted.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
