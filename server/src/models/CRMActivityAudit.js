const mongoose = require("mongoose");

const crmActivityAuditSchema = new mongoose.Schema(
  {
    auditId: { type: String, required: true, unique: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    performedBy: { type: String, default: "SYSTEM" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CRMActivityAudit", crmActivityAuditSchema);
