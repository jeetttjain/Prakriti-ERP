const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserSession = require("../models/UserSession");
const auditLogService = require("./auditLog.service");
const permissionService = require("./permission.service");

const JWT_SECRET = process.env.JWT_SECRET || "prakriti_jwt_sec_123456!";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "prakriti_refresh_sec_7890!";

/**
 * Handles account credentials verification, locks, and session audits.
 */
const login = async (username, password, sessionDetails = {}) => {
  const user = await User.findOne({ userCode: username }).populate("roleId");
  if (!user) {
    throw new Error("Invalid username or password.");
  }

  if (user.status !== "Active") {
    throw new Error("User account is inactive. Please contact support.");
  }

  // Account Lock checks
  const now = new Date();
  if (user.accountLockedUntil && user.accountLockedUntil > now) {
    const minsLeft = Math.ceil((user.accountLockedUntil - now) / 60000);
    throw new Error(`Account is locked due to multiple failed login attempts. Try again in ${minsLeft} minutes.`);
  }

  // Password verification
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
      await auditLogService.logEvent({
        module: "Auth",
        action: "Account Locked",
        performedBy: username,
        targetId: user._id.toString(),
        ipAddress: sessionDetails.ipAddress,
      });
    }
    await user.save();
    throw new Error("Invalid username or password.");
  }

  // Reset lock metrics
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = null;
  user.lastLogin = now;
  await user.save();

  // Create JWT tokens
  const accessToken = jwt.sign(
    { userId: user._id, role: user.roleId.roleName },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Store active Session document
  const session = await UserSession.create({
    userId: user._id,
    refreshToken,
    ipAddress: sessionDetails.ipAddress,
    deviceInfo: sessionDetails.deviceInfo,
    browser: sessionDetails.browser,
    operatingSystem: sessionDetails.operatingSystem,
    isActive: true,
  });

  // Log audit login event
  await auditLogService.logEvent({
    module: "Auth",
    action: "Login Successful",
    performedBy: username,
    targetId: session._id.toString(),
    ipAddress: sessionDetails.ipAddress,
  });

  return {
    user: {
      _id: user._id,
      name: user.name,
      userCode: user.userCode,
      email: user.email,
      role: user.roleId.roleName,
      permissions: user.roleId.permissions || {},
      mustChangePassword: user.mustChangePassword,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Logout session deactivation.
 */
const logout = async (token) => {
  const session = await UserSession.findOneAndUpdate(
    { refreshToken: token, isActive: true },
    { isActive: false, logoutTime: new Date() }
  ).populate("userId");

  if (session && session.userId) {
    await auditLogService.logEvent({
      module: "Auth",
      action: "Logout",
      performedBy: session.userId.email,
      targetId: session._id.toString(),
    });
  }
};

/**
 * Validates refresh token and generates new access token.
 */
const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const session = await UserSession.findOne({ refreshToken: token, isActive: true }).populate("userId");
    if (!session || !session.userId) {
      throw new Error("Invalid or inactive session.");
    }

    const accessToken = jwt.sign(
      { userId: session.userId._id, role: session.userId.roleId ? "User" : "Owner" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { accessToken };
  } catch (err) {
    throw new Error("Failed to refresh session token.");
  }
};

/**
 * Password modification handling.
 */
const changePassword = async (userId, oldPassword, newPassword, ipAddress) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Incorrect current password.");

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordChangedAt = new Date();
  user.mustChangePassword = false;
  await user.save();

  // Deactivate all active sessions for security refresh
  await UserSession.updateMany({ userId, isActive: true }, { isActive: false, logoutTime: new Date() });
  permissionService.invalidateUserCache(userId);

  await auditLogService.logEvent({
    module: "Auth",
    action: "Password Change",
    performedBy: user.email,
    targetId: user._id.toString(),
    ipAddress,
  });
};

/**
 * Administrator reset password trigger.
 */
const resetPassword = async (userId, newPassword, performedByEmail, ipAddress) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  user.password = await bcrypt.hash(newPassword, 10);
  user.mustChangePassword = true; // Force change on next login
  await user.save();

  // Deactivate active sessions
  await UserSession.updateMany({ userId, isActive: true }, { isActive: false, logoutTime: new Date() });
  permissionService.invalidateUserCache(userId);

  await auditLogService.logEvent({
    module: "User",
    action: "Password Reset by Admin",
    performedBy: performedByEmail,
    targetId: user._id.toString(),
    ipAddress,
  });
};

module.exports = {
  login,
  logout,
  refreshToken,
  changePassword,
  resetPassword,
  JWT_SECRET,
};
