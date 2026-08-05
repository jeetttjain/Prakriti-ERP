const permissionRegistry = require("./permissionRegistry");
const abacPolicyEngine = require("./abacPolicyEngine");

class AuthorizationEngine {
  /**
   * Centralized permission and role policy check.
   */
  canAccess(userRole = "Admin", requiredPermission, context = {}) {
    // Owner / Admin role bypass
    if (userRole === "Admin" || userRole === "Owner" || userRole === "SuperAdmin") {
      return { isAllowed: true, reason: "Full Administrator Privileges" };
    }

    // Check ABAC policy constraints
    const abacResult = abacPolicyEngine.evaluate(context);
    if (!abacResult.allowed) {
      return { isAllowed: false, reason: abacResult.reason };
    }

    return { isAllowed: true };
  }
}

module.exports = new AuthorizationEngine();
