const AuditLog = require("../models/AuditLog");
const { generateCounter } = require("./counter.service");

// Keys to strip out for security and credential protection
const SENSITIVE_KEYS = ["password", "token", "refreshToken", "jwt", "secret", "otp", "apiKey", "authHeader"];
const VOLATILE_KEYS = ["__v", "updatedAt", "createdAt"];

/**
 * Sanitizes object by removing sensitive credentials & volatile MongoDB keys.
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(sanitizeData);

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
      clean[key] = "[PROTECTED]";
    } else if (!VOLATILE_KEYS.includes(key)) {
      if (value && typeof value === "object" && !(value instanceof Date)) {
        clean[key] = sanitizeData(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
};

/**
 * Extracts request metadata (IP, User-Agent, Browser, OS, Method, URL).
 */
const parseRequestContext = (req) => {
  if (!req) {
    return {
      ipAddress: "127.0.0.1",
      userAgent: "Server Process",
      browser: "Node.js",
      device: "Server",
      operatingSystem: "Server",
      requestMethod: "INTERNAL",
      requestUrl: "/",
      sessionId: "",
    };
  }

  const ipAddress = req.headers?.["x-forwarded-for"] || req.connection?.remoteAddress || req.ip || "127.0.0.1";
  const userAgent = req.headers?.["user-agent"] || "";

  let browser = "Chrome / Edge";
  if (userAgent.includes("Firefox")) browser = "Firefox";
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";

  let os = "Windows";
  if (userAgent.includes("Mac OS")) os = "macOS";
  if (userAgent.includes("Linux")) os = "Linux";
  if (userAgent.includes("Android")) os = "Android";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";

  let device = "Desktop";
  if (userAgent.includes("Mobi")) device = "Mobile";

  return {
    ipAddress,
    userAgent,
    browser,
    device,
    operatingSystem: os,
    requestMethod: req.method || "GET",
    requestUrl: req.originalUrl || req.url || "/",
    sessionId: req.headers?.["x-session-id"] || "",
  };
};

/**
 * Non-blocking Async Audit Logger.
 * Guarantees business logic never rolls back due to logging error.
 */
const logEvent = (params = {}) => {
  setImmediate(async () => {
    try {
      const {
        module = "System",
        entity = "",
        entityId = "",
        action = "Action",
        actionType = "READ",
        description = "",
        beforeData = null,
        afterData = null,
        user = null,
        req = null,
        responseStatus = 200,
        executionTime = 0,
      } = params;

      const auditNumber = await generateCounter("auditNumber", "AUD", 6);
      const reqContext = parseRequestContext(req);

      const userId = user?._id || user?.id || null;
      const userSnapshot = {
        name: user?.name || user?.businessName || "System / Guest",
        email: user?.email || user?.mobile || "",
        role: user?.roleId?.roleName || user?.role || (userId ? "User" : "Guest"),
      };

      await AuditLog.create({
        auditNumber,
        userId,
        userSnapshot,
        module,
        entity,
        entityId: String(entityId || ""),
        action,
        actionType,
        description: description || `${action} on ${entity || module}`,
        beforeData: sanitizeData(beforeData),
        afterData: sanitizeData(afterData),
        ...reqContext,
        responseStatus,
        executionTime,
      });
    } catch (error) {
      console.error("Non-blocking Audit Log Exception:", error.message);
    }
  });
};

/**
 * Helper: Log Entity Creation
 */
const logCreate = ({ module, entity, entityId, afterData, user, req }) => {
  logEvent({
    module,
    entity,
    entityId,
    action: `Create ${entity}`,
    actionType: "CREATE",
    description: `Created new ${entity} (${entityId || "Record"})`,
    afterData,
    user,
    req,
  });
};

/**
 * Helper: Log Entity Mutation
 */
const logUpdate = ({ module, entity, entityId, beforeData, afterData, user, req }) => {
  logEvent({
    module,
    entity,
    entityId,
    action: `Update ${entity}`,
    actionType: "UPDATE",
    description: `Modified details for ${entity} (${entityId})`,
    beforeData,
    afterData,
    user,
    req,
  });
};

/**
 * Helper: Log Entity Deletion
 */
const logDelete = ({ module, entity, entityId, beforeData, user, req }) => {
  logEvent({
    module,
    entity,
    entityId,
    action: `Delete ${entity}`,
    actionType: "DELETE",
    description: `Archived/Deleted ${entity} record (${entityId})`,
    beforeData,
    user,
    req,
  });
};

/**
 * Query Audit Logs (Paginated + Filtered)
 */
const getAuditLogs = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.module && query.module !== "All") {
    filter.module = query.module;
  }
  if (query.actionType && query.actionType !== "All") {
    filter.actionType = query.actionType;
  }
  if (query.userId) {
    filter.userId = query.userId;
  }
  if (query.search) {
    const reg = new RegExp(query.search, "i");
    filter.$or = [
      { auditNumber: reg },
      { description: reg },
      { action: reg },
      { "userSnapshot.name": reg },
      { "userSnapshot.email": reg },
      { ipAddress: reg },
    ];
  }
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const [items, totalRecords] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    items,
    page,
    limit,
    totalRecords,
    totalPages: Math.ceil(totalRecords / limit),
  };
};

/**
 * Get Single Audit Log Details
 */
const getAuditLogById = async (id) => {
  return AuditLog.findById(id).lean();
};

/**
 * Reconstruct Entity Transaction History
 */
const getEntityHistory = async (entity, entityId) => {
  return AuditLog.find({ entity, entityId }).sort({ createdAt: -1 }).lean();
};

/**
 * Get User Activity Log
 */
const getUserActivity = async (userId, limit = 50) => {
  return AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
};

/**
 * Get Dashboard Activity Analytics & Stats
 */
const getAuditStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalActivities, todayActivities, failedLogins, totalExports] = await Promise.all([
    AuditLog.countDocuments({}),
    AuditLog.countDocuments({ createdAt: { $gte: startOfDay } }),
    AuditLog.countDocuments({ action: "Login Failed" }),
    AuditLog.countDocuments({ actionType: "EXPORT" }),
  ]);

  const recent = await AuditLog.find({}).sort({ createdAt: -1 }).limit(10).lean();

  return {
    totalActivities,
    todayActivities,
    failedLogins,
    totalExports,
    recent,
  };
};

module.exports = {
  sanitizeData,
  logEvent,
  logCreate,
  logUpdate,
  logDelete,
  getAuditLogs,
  getAuditLogById,
  getEntityHistory,
  getUserActivity,
  getAuditStats,
};
