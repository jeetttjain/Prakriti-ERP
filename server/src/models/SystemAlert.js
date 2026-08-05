const mongoose = require("mongoose");

const systemAlertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true },
    severity: { type: String, enum: ["INFO", "WARNING", "CRITICAL"], default: "WARNING" },
    category: { type: String, default: "System" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["Active", "Acknowledged", "Resolved"], default: "Active" },
    acknowledgedBy: { type: String },
    acknowledgedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemAlert", systemAlertSchema);
