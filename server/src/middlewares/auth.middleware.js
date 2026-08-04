const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../services/auth.service");
const permissionService = require("../services/permission.service");
const { errorResponse } = require("../services/response.service");

/**
 * Validates JWT token request header or cookies.
 */
const authenticate = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, "Authentication token required.", 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains userId and role
    next();
  } catch (error) {
    return errorResponse(res, "Invalid or expired session token.", 401);
  }
};

/**
 * Secures routes matching role permissions grids.
 * @param {string} moduleName Module parameter (Customer, Supplier, etc.)
 * @param {string} action Action tag (view, create, edit, delete, export, approve)
 */
const authorize = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return errorResponse(res, "Authentication context not established.", 401);
      }

      const allowed = await permissionService.hasPermission(req.user.userId, moduleName, action);
      if (!allowed) {
        return errorResponse(res, `Forbidden. Missing ${action} permission for ${moduleName} module.`, 403);
      }

      next();
    } catch (error) {
      return errorResponse(res, "Authorization error encountered.", 500);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
};
