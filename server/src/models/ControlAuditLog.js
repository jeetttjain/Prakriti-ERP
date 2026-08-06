const mongoose = require("mongoose");

const controlAuditLogSchema = new mongoose.Schema(
  {
    auditId: { type: String, required: true, unique: true },
    action: { type: String, required: true },
    userCode: { type: String, required: true },
    target: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ControlAuditLog", controlAuditLogSchema);
