/**
 * Centralized Permission Registry mapping ERP modules, actions, and risk levels.
 */
class PermissionRegistry {
  constructor() {
    this.permissions = new Map([
      ["ORDERS_READ", { module: "Orders", action: "READ", riskLevel: "LOW" }],
      ["ORDERS_WRITE", { module: "Orders", action: "WRITE", riskLevel: "MEDIUM" }],
      ["INVOICES_READ", { module: "Invoices", action: "READ", riskLevel: "LOW" }],
      ["INVOICES_WRITE", { module: "Invoices", action: "WRITE", riskLevel: "HIGH" }],
      ["REPORTS_EXPORT", { module: "Reports", action: "EXPORT", riskLevel: "HIGH" }],
      ["SYSTEM_ADMIN", { module: "System", action: "ADMIN", riskLevel: "CRITICAL" }],
    ]);
  }

  getPermission(permId) {
    return this.permissions.get(permId);
  }

  listPermissions() {
    return Array.from(this.permissions.entries()).map(([id, meta]) => ({ permId: id, ...meta }));
  }
}

module.exports = new PermissionRegistry();
