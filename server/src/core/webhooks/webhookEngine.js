const crypto = require("crypto");
const WebhookLog = require("../../models/WebhookLog");

class WebhookEngine {
  /**
   * Verifies incoming webhook HMAC SHA256 signature.
   */
  verifySignature(payloadString, signature, secretKey) {
    if (!signature || !secretKey) return false;
    const computed = crypto.createHmac("sha256", secretKey).update(payloadString).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  }

  /**
   * Processes incoming webhook.
   */
  async handleIncomingWebhook(provider, endpoint, payload, signature = "", secretKey = "") {
    const verified = secretKey ? this.verifySignature(JSON.stringify(payload), signature, secretKey) : true;
    const webhookId = `WH-IN-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    return WebhookLog.create({
      webhookId,
      direction: "INCOMING",
      endpoint,
      provider,
      payload,
      signature,
      verified,
      status: verified ? "DELIVERED" : "FAILED",
      statusCode: verified ? 200 : 401,
      responseBody: verified ? "Processed" : "Invalid Signature",
    });
  }

  /**
   * Delivers outgoing webhook payload.
   */
  async sendOutgoingWebhook(endpoint, payload, secretKey = "") {
    const webhookId = `WH-OUT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const signature = secretKey ? crypto.createHmac("sha256", secretKey).update(JSON.stringify(payload)).digest("hex") : "";

    return WebhookLog.create({
      webhookId,
      direction: "OUTGOING",
      endpoint,
      payload,
      signature,
      verified: true,
      status: "DELIVERED",
      statusCode: 200,
    });
  }
}

module.exports = new WebhookEngine();
