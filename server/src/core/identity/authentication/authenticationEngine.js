const bcrypt = require("bcrypt");
const User = require("../../../models/User");
const tokenEngine = require("../tokens/tokenEngine");
const sessionManager = require("../sessions/sessionManager");
const deviceManager = require("../devices/deviceManager");
const identityRiskEngine = require("../risk/identityRiskEngine");
const identityAudit = require("../audit/identityAudit");

class AuthenticationEngine {
  /**
   * Centralized IAM Login Execution.
   */
  async login(userCode, password, context = {}) {
    const user = await User.findOne({ userCode: userCode.toUpperCase() });
    if (!user) throw new Error("Invalid credentials or user code.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await identityAudit.logEvent("USER_LOGIN_FAILED", userCode, { reason: "Password Mismatch", ip: context.ip });
      throw new Error("Invalid credentials or password.");
    }

    // Risk Calculation & Device Registration
    const risk = identityRiskEngine.calculateRisk({ isNewDevice: true });
    const device = await deviceManager.registerDevice(user.userCode, context.deviceName || "Browser", context.ip);

    // Token & Session Generation
    const tokens = tokenEngine.generateTokens(user);
    const session = await sessionManager.createSession(user.userCode, tokens.tokenHash, device.deviceId, context.ip);

    // Audit Logging
    await identityAudit.logEvent("USER_LOGIN", user.userCode, { sessionId: session.sessionId, riskScore: risk.riskScore });

    return {
      user: {
        userCode: user.userCode,
        fullName: user.fullName,
        role: user.role?.name || user.role,
      },
      tokens,
      session: {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt,
      },
      device: {
        deviceId: device.deviceId,
        isTrusted: device.isTrusted,
        riskScore: risk.riskScore,
      },
    };
  }
}

module.exports = new AuthenticationEngine();
