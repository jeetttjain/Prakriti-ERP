const IdentityAuditLog = require("../../../models/IdentityAuditLog");
const eventPublisher = require("../../events/eventPublisher");

class IdentityAudit {
  async logEvent(action, performedBy, details = {}) {
    const auditId = `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const auditDoc = await IdentityAuditLog.create({
      auditId,
      action,
      performedBy,
      details,
      ipAddress: details.ipAddress || "127.0.0.1",
      correlationId: `CORR-${Date.now()}`,
    });

    // Emit event to Phase 7.3A Event Bus
    eventPublisher.publish(action, { auditId, performedBy, details }, { producerModule: "IAM" }).catch(() => {});

    return auditDoc;
  }
}

module.exports = new IdentityAudit();
