const mongoose = require("mongoose");
const IdentitySession = require("../../../models/IdentitySession");
const tokenEngine = require("../tokens/tokenEngine");

class SessionManager {
  /**
   * Creates an active user session record.
   */
  async createSession(userCode, tokenHash, deviceFingerprint, ipAddress = "127.0.0.1") {
    const sessionId = `SESS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    return IdentitySession.create({
      sessionId,
      userCode,
      tokenHash,
      deviceFingerprint,
      ipAddress,
      status: "Active",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
  }

  /**
   * Revokes a session and blacklists its token.
   */
  async revokeSession(sessionId) {
    const query = mongoose.Types.ObjectId.isValid(sessionId)
      ? { $or: [{ _id: sessionId }, { sessionId }] }
      : { sessionId };
    const session = await IdentitySession.findOne(query);
    if (!session) throw new Error("Session record not found.");

    session.status = "Revoked";
    await session.save();

    await tokenEngine.revokeToken(session.tokenHash, session.userCode, "Session revoked by user/admin");

    return session;
  }
}

module.exports = new SessionManager();
