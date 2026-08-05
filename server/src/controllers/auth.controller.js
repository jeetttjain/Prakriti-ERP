const authService = require("../services/auth.service");
const { successResponse, errorResponse } = require("../services/response.service");
const User = require("../models/User");

// USER LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";

    const details = await authService.login(username, password, {
      ipAddress,
      deviceInfo: userAgent,
      browser: userAgent.includes("Chrome") ? "Chrome" : "Other",
      operatingSystem: userAgent.includes("Windows") ? "Windows" : "Other",
    });

    // Set cookie
    res.cookie("token", details.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1h
    });

    return successResponse(res, details);
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

// USER LOGOUT
exports.logout = async (req, res) => {
  try {
    const token = req.body.refreshToken || req.cookies?.token;
    await authService.logout(token);
    res.clearCookie("token");
    return successResponse(res, { message: "Logged out successfully." });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// REFRESH TOKEN
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const details = await authService.refreshToken(refreshToken);
    return successResponse(res, details);
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    await authService.changePassword(req.user.userId, oldPassword, newPassword, ipAddress);
    return successResponse(res, { message: "Password updated successfully." });
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// RESET PASSWORD (ADMIN TRIGGER)
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Fetch caller user code/email
    const caller = await User.findById(req.user.userId);
    const callerEmail = caller ? caller.email : "Admin";

    await authService.resetPassword(userId, newPassword, callerEmail, ipAddress);
    return successResponse(res, { message: "User password reset successfully." });
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// GET CURRENT USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("roleId");
    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }
    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
