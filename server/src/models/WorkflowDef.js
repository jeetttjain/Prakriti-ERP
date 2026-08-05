const mongoose = require("mongoose");

const workflowDefSchema = new mongoose.Schema(
  {
    workflowId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    version: { type: Number, default: 1 },
    parentVersionId: { type: String },
    status: { type: String, enum: ["Draft", "Published", "Deprecated", "Archived"], default: "Published" },
    triggerEvent: { type: String, required: true },
    steps: [
      {
        stepId: { type: String, required: true },
        type: { type: String, enum: ["Trigger", "Condition", "Action", "Else", "Delay", "Repeat", "Finish"], required: true },
        config: { type: mongoose.Schema.Types.Mixed, default: {} },
      },
    ],
    createdBy: { type: String, default: "Admin" },
    executionCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkflowDef", workflowDefSchema);
