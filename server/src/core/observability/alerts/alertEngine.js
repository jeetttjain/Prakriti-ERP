const mongoose = require("mongoose");
const SystemAlert = require("../../../models/SystemAlert");
const notificationRouter = require("../../communication/routing/notificationRouter");
const eventPublisher = require("../../events/eventPublisher");

class AlertEngine {
  /**
   * Generates system alert and dispatches notification via Communication Platform.
   */
  async triggerAlert(title, message, severity = "WARNING", category = "System") {
    const alertId = `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const alertDoc = await SystemAlert.create({
      alertId,
      severity,
      category,
      title,
      message,
      status: "Active",
    });

    // Dispatch via Communication Router if critical
    if (severity === "CRITICAL") {
      notificationRouter.send({
        recipientId: "ADMIN-001",
        recipientAddress: "+919876543210",
        templateId: "TMPL_CRITICAL_ALERT",
        variables: { alertTitle: title, alertMessage: message },
        entityType: "System",
        entityId: alertId,
        category: "Alerts",
      }).catch(() => {});
    }

    eventPublisher.publish("ALERT_TRIGGERED", { alertId, severity, title }, { producerModule: "EOP" }).catch(() => {});

    return alertDoc;
  }

  /**
   * Acknowledges an active alert.
   */
  async acknowledgeAlert(alertId, userCode = "Admin") {
    const query = mongoose.Types.ObjectId.isValid(alertId)
      ? { $or: [{ _id: alertId }, { alertId }] }
      : { alertId };
    const alert = await SystemAlert.findOne(query);
    if (!alert) throw new Error("System alert record not found.");

    alert.status = "Acknowledged";
    alert.acknowledgedBy = userCode;
    alert.acknowledgedAt = new Date();
    await alert.save();

    return alert;
  }
}

module.exports = new AlertEngine();
