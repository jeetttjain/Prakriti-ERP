/**
 * Abstracted Plugin Registry for Identity Providers (Local, LDAP, AD, OAuth2, OIDC, SAML).
 */
class IdentityProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.initDefaultProviders();
  }

  initDefaultProviders() {
    this.register("Local", { authenticate: async (creds) => ({ success: true, provider: "Local" }) });
    this.register("OAuth2_Google", { authenticate: async (creds) => ({ success: true, provider: "Google" }) });
    this.register("SAML_Enterprise", { authenticate: async (creds) => ({ success: true, provider: "SAML" }) });
    this.register("LDAP_ActiveDirectory", { authenticate: async (creds) => ({ success: true, provider: "LDAP" }) });
  }

  register(providerName, providerInstance) {
    this.providers.set(providerName, providerInstance);
  }

  getProvider(providerName = "Local") {
    return this.providers.get(providerName) || this.providers.get("Local");
  }

  listProviders() {
    return Array.from(this.providers.keys());
  }
}

module.exports = new IdentityProviderRegistry();
