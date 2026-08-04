const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");
const { successResponse, errorResponse } = require("../services/response.service");
const auditLogService = require("../services/auditLog.service");
const permissionService = require("../services/permission.service");

// LIST USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").populate("roleId");
    return successResponse(res, users);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email, mobile, password, roleId, status, userCode } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse(res, "Email address already registered.", 400);
    }

    const hashedPassword = await bcrypt.hash(password || "prakriti123", 10);
    
    // Fetch caller email
    const caller = await User.findById(req.user.userId);
    const performedBy = caller ? caller.email : "System";

    const user = await User.create({
      userCode: userCode || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      mobile,
      password: hashedPassword,
      roleId,
      status: status || "Active",
      createdBy: performedBy,
    });

    await auditLogService.logEvent({
      module: "User",
      action: "User Created",
      performedBy,
      targetId: user._id.toString(),
    });

    const populated = await User.findById(user._id).select("-password").populate("roleId");
    return successResponse(res, populated, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, roleId, status, userCode, mustChangePassword } = req.body;

    const caller = await User.findById(req.user.userId);
    const performedBy = caller ? caller.email : "System";

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }

    // Capture role change to invalidate cache
    const roleChanged = user.roleId.toString() !== roleId;

    user.name = name || user.name;
    user.email = email || user.email;
    user.mobile = mobile !== undefined ? mobile : user.mobile;
    user.roleId = roleId || user.roleId;
    user.status = status || user.status;
    user.userCode = userCode || user.userCode;
    if (mustChangePassword !== undefined) {
      user.mustChangePassword = mustChangePassword;
    }
    user.updatedBy = performedBy;
    
    await user.save();

    if (roleChanged) {
      permissionService.invalidateUserCache(id);
    }

    await auditLogService.logEvent({
      module: "User",
      action: "User Updated",
      performedBy,
      targetId: id,
    });

    const populated = await User.findById(id).select("-password").populate("roleId");
    return successResponse(res, populated);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const caller = await User.findById(req.user.userId);
    const performedBy = caller ? caller.email : "System";

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }

    permissionService.invalidateUserCache(id);

    await auditLogService.logEvent({
      module: "User",
      action: "User Deleted",
      performedBy,
      targetId: id,
    });

    return successResponse(res, { message: "User deleted successfully." });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
