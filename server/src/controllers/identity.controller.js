const User = require("../models/User");
const IdentitySession = require("../models/IdentitySession");
const IdentityDevice = require("../models/IdentityDevice");
const ApiKey = require("../models/ApiKey");
const SecurityPolicy = require("../models/SecurityPolicy");
const authenticationEngine = require("../core/identity/authentication/authenticationEngine");
const sessionManager = require("../core/identity/sessions/sessionManager");
const deviceManager = require("../core/identity/devices/deviceManager");
const apiKeyManager = require("../core/identity/apikeys/apiKeyManager");
const identityAudit = require("../core/identity/audit/identityAudit");
const { successResponse, errorResponse } = require("../services/response.service");

// POST /api/identity/login
exports.login = async (req, res) => {
  try {
    const { userCode, password } = req.body;
    const result = await authenticationEngine.login(userCode, password, { ip: req.ip });
    return successResponse(res, result, "User authenticated via IAM Platform.");
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

// POST /api/identity/logout
exports.logout = async (req, res) => {
  try {
    if (req.body.sessionId) {
      await sessionManager.revokeSession(req.body.sessionId);
    }
    await identityAudit.logEvent("USER_LOGOUT", req.user?.userCode || "Admin", { ip: req.ip });
    return successResponse(res, null, "Logged out via IAM Platform.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// GET /api/identity/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return successResponse(res, users, "IAM users retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/identity/sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await IdentitySession.find({}).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, sessions, "IAM active sessions retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/identity/devices
exports.getDevices = async (req, res) => {
  try {
    const devices = await IdentityDevice.find({}).sort({ lastLoginAt: -1 }).limit(50);
    return successResponse(res, devices, "Registered devices retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/identity/apikeys
exports.getApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({ status: "Active" }).sort({ createdAt: -1 });
    return successResponse(res, keys, "API keys retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/identity/security
exports.getSecurityConfig = async (req, res) => {
  try {
    let policy = await SecurityPolicy.findOne({});
    if (!policy) {
      policy = await SecurityPolicy.create({
        policyId: "SEC-POL-01",
        policyName: "Enterprise Security Policy",
      });
    }
    return successResponse(res, policy, "Security policy config loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/identity/session/revoke
exports.revokeSession = async (req, res) => {
  try {
    const session = await sessionManager.revokeSession(req.body.sessionId);
    await identityAudit.logEvent("SESSION_REVOKED", req.user?.userCode || "Admin", { sessionId: req.body.sessionId });
    return successResponse(res, session, "Session revoked.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/identity/device/trust
exports.trustDevice = async (req, res) => {
  try {
    const dev = await deviceManager.updateDeviceStatus(req.body.deviceId, true, false);
    await identityAudit.logEvent("DEVICE_TRUSTED", req.user?.userCode || "Admin", { deviceId: req.body.deviceId });
    return successResponse(res, dev, "Device trusted.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/identity/device/block
exports.blockDevice = async (req, res) => {
  try {
    const dev = await deviceManager.updateDeviceStatus(req.body.deviceId, false, true);
    await identityAudit.logEvent("DEVICE_BLOCKED", req.user?.userCode || "Admin", { deviceId: req.body.deviceId });
    return successResponse(res, dev, "Device blocked.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/identity/apikey
exports.createApiKey = async (req, res) => {
  try {
    const result = await apiKeyManager.createApiKey(req.body.name, req.user?.userCode || "Admin", req.body.scopes);
    await identityAudit.logEvent("APIKEY_CREATED", req.user?.userCode || "Admin", { keyId: result.keyId });
    return successResponse(res, result, "API key created.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/identity/security-policy
exports.updateSecurityPolicy = async (req, res) => {
  try {
    const policy = await SecurityPolicy.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    return successResponse(res, policy, "Security policy updated.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// DELETE /api/identity/apikey/:id
exports.deleteApiKey = async (req, res) => {
  try {
    await ApiKey.findOneAndUpdate({ keyId: req.params.id }, { status: "Revoked" });
    return successResponse(res, null, "API key revoked.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
