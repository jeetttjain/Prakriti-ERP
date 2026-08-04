const express = require("express");
const router = express.Router();
const {
  getAuditLogs,
  getAuditStats,
  getAuditLogById,
  getEntityHistory,
  getUserActivity,
  getModuleActivity,
} = require("../controllers/auditLog.controller");

const { authenticate, checkPermission } = require("../middlewares/auth.middleware");

// Enforce authentication & read-only access
router.use(authenticate);

// Audit Dashboard Statistics
router.get("/activity", getAuditStats);

// Filtered Audit Index
router.get("/", getAuditLogs);

// Single Audit Log Entry
router.get("/:id", getAuditLogById);

// Reconstruct Entity Timeline
router.get("/entity/:entity/:id", getEntityHistory);

// User Activity History
router.get("/user/:userId", getUserActivity);

// Module Activity Stream
router.get("/module/:module", getModuleActivity);

module.exports = router;
