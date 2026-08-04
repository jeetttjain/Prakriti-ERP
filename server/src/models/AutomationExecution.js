const mongoose = require("mongoose");

const actionResultSchema = new mongoose.Schema(
  {
    actionType: { type: String, required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED", "SKIPPED"], default: "SUCCESS" },
    error: { type: String, default: null },
    output: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const automationExecutionSchema = new mongoose.Schema(
  {
    executionNumber: {
      type: String,
      unique: true,
      index: true,
    },
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutomationRule",
      required: true,
      index: true,
    },
    ruleName: {
      type: String,
      default: "",
    },
    ruleVersion: {
      type: Number,
      default: 1,
    },
    trigger: {
      type: String,
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      default: "",
    },
    executionHash: {
      type: String,
      default: "",
      index: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "FAILED_PERMANENT", "RUNNING", "PENDING"],
      default: "PENDING",
      index: true,
    },
    executionTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    duration: {
      type: Number,
      default: 0, // Execution duration in milliseconds
    },
    error: {
      type: String,
      default: null,
    },
    output: [actionResultSchema],
    triggeredBy: {
      type: String,
      enum: ["EVENT", "SCHEDULER", "MANUAL"],
      default: "EVENT",
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

automationExecutionSchema.index({ createdAt: -1, status: 1 });
automationExecutionSchema.index({ ruleId: 1, createdAt: -1 });
automationExecutionSchema.index({ executionHash: 1, createdAt: -1 });

module.exports = mongoose.model("AutomationExecution", automationExecutionSchema);
