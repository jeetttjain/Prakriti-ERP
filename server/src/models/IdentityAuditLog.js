const mongoose = require("mongoose");

const identityAuditLogSchema = new mongoose.Schema(
  {
    auditId: { type: String, required: true, unique: true },
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    targetUser: { type: String },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    beforeState: { type: mongoose.Schema.Types.Mixed },
    afterState: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    correlationId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("IdentityAuditLog", identityAuditLogSchema);
