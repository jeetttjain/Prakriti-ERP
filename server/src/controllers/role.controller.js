const Role = require("../models/Role");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../services/response.service");
const auditLogService = require("../services/auditLog.service");
const permissionService = require("../services/permission.service");

// LIST ROLES
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    return successResponse(res, roles);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// CREATE ROLE
exports.createRole = async (req, res) => {
  try {
    const { roleName, description, permissions, isSystemRole } = req.body;

    const existing = await Role.findOne({ roleName });
    if (existing) {
      return errorResponse(res, "Role name already exists.", 400);
    }

    const caller = await User.findById(req.user.userId);
    const performedBy = caller ? caller.email : "System";

    const role = await Role.create({
      roleName,
      description,
      permissions: permissions || {},
      isSystemRole: !!isSystemRole,
    });

    await auditLogService.logEvent({
      module: "Role",
      action: "Role Created",
      performedBy,
      targetId: role._id.toString(),
    });

    return successResponse(res, role, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// UPDATE ROLE
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName, description, permissions } = req.body;

    const caller = await User.findById(req.user.userId);
    const performedBy = caller ? caller.email : "System";

    const role = await Role.findById(id);
    if (!role) {
      return errorResponse(res, "Role not found.", 404);
    }

    if (role.isSystemRole && roleName && roleName !== role.roleName) {
      return errorResponse(res, "System role name cannot be modified.", 400);
    }

    role.roleName = roleName || role.roleName;
    role.description = description !== undefined ? description : role.description;
    if (permissions) {
      role.permissions = permissions;
    }

    await role.save();

    // Auto Invalidate cached permission states globally when role details change
    permissionService.invalidateAllCaches();

    await auditLogService.logEvent({
      module: "Role",
      action: "Role & Permissions Updated",
      performedBy,
      targetId: id,
    });

    return successResponse(res, role);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE ROLE
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      return errorResponse(res, "Role not found.", 404);
    }

    if (role.isSystemRole) {
      return errorResponse(res, "System roles cannot be deleted.", 400);
    }

    // Check if role is assigned to active user accounts
    const inUse = await User.findOne({ roleId: id });
    if (inUse) {
      return errorResponse(res, "Cannot delete role while assigned to active users.", 400);
    }

    const caller = await User.findById(req.user.userId);
    const performedBy = caller ? caller.email : "System";

    await Role.findByIdAndDelete(id);

    // Invalidate caches
    permissionService.invalidateAllCaches();

    await auditLogService.logEvent({
      module: "Role",
      action: "Role Deleted",
      performedBy,
      targetId: id,
    });

    return successResponse(res, { message: "Role deleted successfully." });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
