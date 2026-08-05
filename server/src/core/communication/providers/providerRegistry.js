/**
 * Provider-Agnostic Plugin Registry supporting multiple messaging providers per channel.
 */
class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.initDefaultProviders();
  }

  initDefaultProviders() {
    // Register Default Abstract Providers
    this.register("WhatsApp", "MetaCloudAPI", { send: async (msg) => ({ success: true, providerMsgId: `META-${Date.now()}` }) });
    this.register("WhatsApp", "TwilioWhatsApp", { send: async (msg) => ({ success: true, providerMsgId: `TW-WA-${Date.now()}` }) });
    
    this.register("Email", "SMTP", { send: async (msg) => ({ success: true, providerMsgId: `SMTP-${Date.now()}` }) });
    this.register("Email", "SendGrid", { send: async (msg) => ({ success: true, providerMsgId: `SG-${Date.now()}` }) });
    
    this.register("SMS", "MSG91", { send: async (msg) => ({ success: true, providerMsgId: `MSG91-${Date.now()}` }) });
    this.register("SMS", "TwilioSMS", { send: async (msg) => ({ success: true, providerMsgId: `TW-SMS-${Date.now()}` }) });

    this.register("Push", "FirebaseFCM", { send: async (msg) => ({ success: true, providerMsgId: `FCM-${Date.now()}` }) });
    this.register("In-App", "SystemNotification", { send: async (msg) => ({ success: true, providerMsgId: `INAPP-${Date.now()}` }) });
  }

  register(channel, providerName, providerInstance) {
    const key = `${channel}_${providerName}`;
    this.providers.set(key, { channel, providerName, instance: providerInstance });
  }

  getProvider(channel, providerName) {
    const key = `${channel}_${providerName}`;
    const p = this.providers.get(key);
    return p ? p.instance : null;
  }

  /**
   * Returns list of registered providers for a channel.
   */
  getProvidersForChannel(channel) {
    const list = [];
    for (const [key, val] of this.providers.entries()) {
      if (val.channel === channel) {
        list.push(val);
      }
    }
    return list;
  }
}

module.exports = new ProviderRegistry();
