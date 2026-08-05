const mongoose = require("mongoose");

const financialAuditSchema = new mongoose.Schema(
  {
    auditId: { type: String, required: true, unique: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    action: { type: String, required: true },
    beforeValue: { type: mongoose.Schema.Types.Mixed },
    afterValue: { type: mongoose.Schema.Types.Mixed },
    userCode: { type: String, required: true },
    correlationId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FinancialAudit", financialAuditSchema);
