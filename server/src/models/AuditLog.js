const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    auditNumber: {
      type: String,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    userSnapshot: {
      name: { type: String, default: "System / Guest" },
      email: { type: String, default: "" },
      role: { type: String, default: "Guest" },
    },
    roleSnapshot: {
      roleName: { type: String, default: "" },
      permissions: [{ type: String }],
    },
    module: {
      type: String,
      required: true,
      index: true,
    },
    entity: {
      type: String,
      default: "",
      index: true,
    },
    entityId: {
      type: String,
      default: "",
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: ["CREATE", "READ", "UPDATE", "DELETE", "SECURITY", "EXPORT"],
      default: "READ",
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    beforeData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    afterData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "",
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    device: {
      type: String,
      default: "Desktop",
    },
    operatingSystem: {
      type: String,
      default: "Windows",
    },
    requestMethod: {
      type: String,
      default: "GET",
    },
    requestUrl: {
      type: String,
      default: "",
    },
    responseStatus: {
      type: Number,
      default: 200,
    },
    executionTime: {
      type: Number,
      default: 0, // In milliseconds
    },
    sessionId: {
      type: String,
      default: "",
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Indexes for fast server-side pagination & activity filtering
auditLogSchema.index({ createdAt: -1, module: 1 });
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
