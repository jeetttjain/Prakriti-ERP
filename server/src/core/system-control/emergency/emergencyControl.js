const eventPublisher = require("../../events/eventPublisher");
const notificationRouter = require("../../communication/routing/notificationRouter");

class EmergencyControl {
  /**
   * Triggers emergency kill switch action.
   */
  async triggerEmergencyAction(target = "AUTOMATION_STOP", userCode = "ADMIN-01") {
    const timestamp = new Date();

    // Dispatch emergency notification via Communication Router
    notificationRouter.send({
      recipientId: "ADMIN-001",
      recipientAddress: "+919876543210",
      templateId: "TMPL_EMERGENCY_ALERT",
      variables: { target, userCode },
      entityType: "SystemControl",
      entityId: `EMERGENCY-${Date.now()}`,
      category: "Emergency",
    }).catch(() => {});

    // Emit EMERGENCY_TRIGGERED event to Phase 7.3A Event Bus
    eventPublisher.publish("EMERGENCY_TRIGGERED", { target, userCode, timestamp }, { producerModule: "SCE" }).catch(() => {});

    return {
      status: "EMERGENCY_EXECUTED",
      target,
      userCode,
      timestamp,
    };
  }
}

module.exports = new EmergencyControl();
