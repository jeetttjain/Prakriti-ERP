const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const TokenBlacklist = require("../../../models/TokenBlacklist");

const JWT_SECRET = process.env.JWT_SECRET || "prakriti_iam_secure_jwt_secret_key_2026";

class TokenEngine {
  /**
   * Generates Access Token & Refresh Token pair with token rotation support.
   */
  generateTokens(userObj) {
    const payload = {
      userCode: userObj.userCode,
      role: userObj.role?.name || userObj.role || "Admin",
      tenantId: userObj.tenantId || "DEFAULT_TENANT",
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ ...payload, type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });

    const tokenHash = crypto.createHash("sha256").update(accessToken).digest("hex");

    return {
      accessToken,
      refreshToken,
      tokenHash,
      expiresIn: 3600,
    };
  }

  /**
   * Verifies access token and checks blacklist.
   */
  async verifyToken(token) {
    const decoded = jwt.verify(token, JWT_SECRET);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const blacklisted = await TokenBlacklist.findOne({ tokenHash });
    if (blacklisted) {
      throw new Error("Token has been revoked or blacklisted.");
    }

    return decoded;
  }

  /**
   * Blacklists a token on logout or session revocation.
   */
  async revokeToken(token, userCode, reason = "Revoked by user/admin") {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    return TokenBlacklist.create({
      tokenHash,
      userCode,
      reason,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
  }
}

module.exports = new TokenEngine();
