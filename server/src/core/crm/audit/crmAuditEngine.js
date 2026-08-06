const CRMActivityAudit = require("../../../models/CRMActivityAudit");
const telemetryPipeline = require("../../observability/telemetry/telemetryPipeline");

class CRMAuditEngine {
  async logAudit(action, entityType, entityId, performedBy = "SYSTEM") {
    const auditId = `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const audit = await CRMActivityAudit.create({
      auditId,
      action,
      entityType,
      entityId,
      performedBy,
    });

    // Record metric log trace into Phase 7.6 EOP
    telemetryPipeline.log("info", "ECXP_AUDIT", `CRM Audit Logged: ${action}`, { entityType, entityId, performedBy }).catch(() => {});

    return audit;
  }

  async getAuditLogs() {
    return CRMActivityAudit.find({}).sort({ createdAt: -1 }).limit(50);
  }
}

module.exports = new CRMAuditEngine();
