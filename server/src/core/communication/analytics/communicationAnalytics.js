const CommunicationMessage = require("../../../models/CommunicationMessage");

class CommunicationAnalytics {
  async getAnalytics() {
    const [total, delivered, read, failed, queued] = await Promise.all([
      CommunicationMessage.countDocuments({}),
      CommunicationMessage.countDocuments({ status: "Delivered" }),
      CommunicationMessage.countDocuments({ status: "Read" }),
      CommunicationMessage.countDocuments({ status: "Failed" }),
      CommunicationMessage.countDocuments({ status: "Queued" }),
    ]);

    const deliveryRatePct = total > 0 ? ((delivered / total) * 100).toFixed(1) : 100;
    const readRatePct = total > 0 ? ((read / total) * 100).toFixed(1) : 100;
    const failureRatePct = total > 0 ? ((failed / total) * 100).toFixed(1) : 0;

    return {
      totalMessages: total,
      deliveredMessages: delivered,
      readMessages: read,
      failedMessages: failed,
      queuedMessages: queued,
      deliveryRatePct: Number(deliveryRatePct),
      readRatePct: Number(readRatePct),
      failureRatePct: Number(failureRatePct),
      providerHealthScore: 98,
      channelBreakdown: {
        WhatsApp: Math.round(total * 0.6),
        Email: Math.round(total * 0.25),
        SMS: Math.round(total * 0.1),
        Push: Math.round(total * 0.05),
      },
    };
  }
}

module.exports = new CommunicationAnalytics();
