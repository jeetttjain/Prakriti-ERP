const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    recId: { type: String, required: true, unique: true },
    ruleId: { type: String, required: true },
    category: {
      type: String,
      enum: ["Sales", "Inventory", "Customer", "Supplier", "Finance", "Purchase", "System"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["Critical", "Warning", "Info", "Success"],
      default: "Info",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    reason: { type: String },
    suggestedAction: { type: String },
    estimatedImpact: { type: String },
    navigationTarget: {
      path: { type: String },
      label: { type: String },
    },
    status: {
      type: String,
      enum: ["New", "Active", "Acknowledged", "In Progress", "Resolved", "Archived", "Expired"],
      default: "Active",
    },
    assignedTo: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: String },
    resolutionNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
