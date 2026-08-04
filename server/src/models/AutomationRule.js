const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    operator: {
      type: String,
      enum: ["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "CONTAINS", "IN", "NOT_IN"],
      default: "EQUALS",
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const actionSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      enum: [
        "SEND_NOTIFICATION",
        "SEND_EMAIL",
        "SEND_WHATSAPP",
        "SEND_SMS",
        "GENERATE_REPORT",
        "GENERATE_PDF",
        "GENERATE_EXCEL",
        "GENERATE_CSV",
        "CREATE_AUDIT_ENTRY",
        "RUN_CUSTOM_SCRIPT",
        "BACKUP_DATABASE",
      ],
      required: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const automationRuleSchema = new mongoose.Schema(
  {
    ruleNumber: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    module: {
      type: String,
      required: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: String,
      default: "Admin Console",
    },
    trigger: {
      type: String,
      required: true,
      index: true,
    },
    conditions: [conditionSchema],
    actions: [actionSchema],
    priority: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM",
    },
    isEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    cronExpression: {
      type: String,
      default: "",
    },
    scheduleInterval: {
      type: String,
      enum: ["EVENT_DRIVEN", "DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM_CRON", "ONE_TIME"],
      default: "EVENT_DRIVEN",
    },
    cooldownMinutes: {
      type: Number,
      default: 5,
    },
    maxTimeout: {
      type: Number,
      default: 30000, // 30 seconds max execution timeout
    },
    lastRun: {
      type: Date,
      default: null,
    },
    nextRun: {
      type: Date,
      default: null,
      index: true,
    },
    createdBy: {
      type: String,
      default: "System",
    },
    executionCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for rule lookup and scheduled background checks
automationRuleSchema.index({ isEnabled: 1, trigger: 1, module: 1 });
automationRuleSchema.index({ isEnabled: 1, scheduleInterval: 1, nextRun: 1 });

module.exports = mongoose.model("AutomationRule", automationRuleSchema);
