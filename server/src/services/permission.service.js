const User = require("../models/User");
const cache = require("./cache.service");

/**
 * Resolves permissions grid for a user, fetching and caching details.
 */
const getUserPermissions = async (userId) => {
  const cacheKey = `user_perms_${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const user = await User.findById(userId).populate("roleId");
  if (!user || !user.roleId) return null;

  const perms = {};
  if (user.roleId.permissions) {
    user.roleId.permissions.forEach((val, key) => {
      perms[key] = {
        view: !!val.view,
        create: !!val.create,
        edit: !!val.edit,
        delete: !!val.delete,
        export: !!val.export,
        approve: !!val.approve,
      };
    });
  }

  const result = {
    isOwner: user.roleId.roleName === "Owner",
    permissions: perms,
    status: user.status,
  };

  cache.set(cacheKey, result, 3600); // Cache for 1 hour
  return result;
};

/**
 * Checks if a user has specific actions access.
 */
const hasPermission = async (userId, moduleName, action) => {
  const details = await getUserPermissions(userId);
  if (!details || details.status !== "Active") return false;
  if (details.isOwner) return true;

  const modPerm = details.permissions[moduleName];
  if (!modPerm) return false;
  return !!modPerm[action];
};

/**
 * Checks if a user has basic module entry view access.
 */
const hasModuleAccess = async (userId, moduleName) => {
  const details = await getUserPermissions(userId);
  if (!details || details.status !== "Active") return false;
  if (details.isOwner) return true;

  const modPerm = details.permissions[moduleName];
  if (!modPerm) return false;
  return Object.values(modPerm).some((val) => !!val);
};

/**
 * Invalidate a specific user cache entry.
 */
const invalidateUserCache = (userId) => {
  cache.delete(`user_perms_${userId}`);
};

/**
 * Invalidates all cached permission states.
 */
const invalidateAllCaches = () => {
  cache.clear();
};

module.exports = {
  getUserPermissions,
  hasPermission,
  hasModuleAccess,
  invalidateUserCache,
  invalidateAllCaches,
};
