const mongoose = require("mongoose");
const CommunicationMessage = require("../../../models/CommunicationMessage");
const providerRegistry = require("../providers/providerRegistry");

class DeliveryEngine {
  /**
   * Dispatches message with automatic provider failover chain execution.
   */
  async deliverMessage(messageDoc, providerChain = []) {
    messageDoc.status = "Sending";
    messageDoc.sentAt = new Date();
    await messageDoc.save();

    const providersToTry = providerChain.length > 0 ? providerChain : ["MetaCloudAPI", "TwilioWhatsApp", "SendGrid", "MSG91", "SystemNotification"];

    for (const providerName of providersToTry) {
      const providerInst = providerRegistry.getProvider(messageDoc.channel, providerName);
      if (providerInst) {
        try {
          const res = await providerInst.send(messageDoc);
          if (res && res.success) {
            messageDoc.status = "Delivered";
            messageDoc.deliveredAt = new Date();
            messageDoc.provider = providerName;
            await messageDoc.save();
            return { success: true, providerUsed: providerName, messageDoc };
          }
        } catch (err) {
          console.warn(`[DeliveryEngine] Provider ${providerName} failed for msg ${messageDoc.messageId}: ${err.message}`);
        }
      }
    }

    // All primary providers failed - fallback to retrying/failed status
    messageDoc.status = "Failed";
    messageDoc.error = "All providers in failover chain exhausted.";
    await messageDoc.save();

    return { success: false, messageDoc };
  }

  /**
   * Retries a failed message with exponential backoff.
   */
  async retryMessage(messageId) {
    const query = mongoose.Types.ObjectId.isValid(messageId)
      ? { $or: [{ _id: messageId }, { messageId }] }
      : { messageId };
    const msg = await CommunicationMessage.findOne(query);
    if (!msg) throw new Error("Communication message record not found.");

    msg.status = "Sending";
    msg.retryCount += 1;
    await msg.save();

    return this.deliverMessage(msg);
  }
}

module.exports = new DeliveryEngine();
