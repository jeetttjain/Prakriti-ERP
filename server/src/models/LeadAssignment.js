const mongoose = require("mongoose");

const leadAssignmentSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, required: true, unique: true },
    leadId: { type: String, required: true },
    algorithm: { type: String, enum: ["RoundRobin", "TerritoryBased", "LeastLoaded", "Manual"], default: "RoundRobin" },
    assignedTo: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeadAssignment", leadAssignmentSchema);
