const crypto = require("crypto");
const ApiKey = require("../../../models/ApiKey");

class ApiKeyManager {
  /**
   * Generates a new API Key with HMAC signature hash.
   */
  async createApiKey(name, userCode, scopes = ["READ_ONLY"]) {
    const keyId = `APIKEY-${Date.now()}`;
    const rawKey = `pk_live_${crypto.randomBytes(16).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiDoc = await ApiKey.create({
      keyId,
      name,
      keyHash,
      userCode,
      scopes,
      status: "Active",
    });

    return {
      keyId: apiDoc.keyId,
      name: apiDoc.name,
      rawKey, // Returned once on creation
      scopes: apiDoc.scopes,
      status: apiDoc.status,
    };
  }
}

module.exports = new ApiKeyManager();
