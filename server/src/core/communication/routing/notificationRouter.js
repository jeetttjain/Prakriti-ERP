const CommunicationPreference = require("../../../models/CommunicationPreference");
const CommunicationPolicy = require("../../../models/CommunicationPolicy");
const CommunicationConversation = require("../../../models/CommunicationConversation");
const CommunicationMessage = require("../../../models/CommunicationMessage");
const templateEngine = require("../templates/templateEngine");
const deliveryEngine = require("../delivery/deliveryEngine");

class NotificationRouter {
  /**
   * Resolves recipient preferred channel or channel policy fallback.
   */
  async resolveChannelAndPolicy(recipientId, category = "Transactional") {
    // 1. Check Policy Override
    const policy = await CommunicationPolicy.findOne({ category });
    if (policy) {
      return { channel: policy.primaryChannel, fallback: policy.fallbackChannel };
    }

    // 2. Check User Preference
    const pref = await CommunicationPreference.findOne({ targetId: recipientId });
    if (pref && !pref.isMuted) {
      return { channel: pref.preferredChannel, fallback: "Email" };
    }

    return { channel: "WhatsApp", fallback: "Email" };
  }

  /**
   * Routes and sends a message request.
   */
  async send(request = {}) {
    const { recipientId, recipientAddress, templateId, variables = {}, entityType = "Order", entityId = "ORD-001" } = request;

    // 1. Get or Create Omnichannel Conversation Thread
    let conv = await CommunicationConversation.findOne({ entityType, entityId });
    if (!conv) {
      const convId = `CONV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      conv = await CommunicationConversation.create({
        conversationId: convId,
        entityType,
        entityId,
        customerContact: recipientAddress,
        status: "Active",
      });
    }

    // 2. Resolve Channel & Render Template
    const { channel, fallback } = await this.resolveChannelAndPolicy(recipientId, request.category);
    const rendered = await templateEngine.getAndRender(templateId, variables);

    // 3. Create CommunicationMessage Doc
    const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const msgDoc = await CommunicationMessage.create({
      messageId,
      conversationId: conv.conversationId,
      channel,
      provider: "MetaCloudAPI",
      recipient: { address: recipientAddress || "+919876543210" },
      subject: rendered.subject,
      content: rendered.body,
      templateId,
      status: "Queued",
      correlationId: `CORR-${Date.now()}`,
    });

    // 4. Deliver via Delivery Engine
    const result = await deliveryEngine.deliverMessage(msgDoc);

    // If failed, trigger fallback channel
    if (!result.success && fallback && fallback !== channel) {
      console.log(`[NotificationRouter] Fallback triggered: ${channel} -> ${fallback}`);
      msgDoc.channel = fallback;
      await msgDoc.save();
      await deliveryEngine.deliverMessage(msgDoc);
    }

    // Update conversation timeline
    conv.channelHistory.push(msgDoc.channel);
    conv.lastMessageAt = new Date();
    await conv.save();

    return msgDoc;
  }
}

module.exports = new NotificationRouter();
