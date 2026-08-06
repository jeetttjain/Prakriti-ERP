const DiscountApproval = require("../../../models/DiscountApproval");

class CRMApprovalEngine {
  async requestDiscountApproval(customerCode, requestedDiscountPct, approverCode = "SALES-MGR-01") {
    const approvalId = `APR-${Date.now()}`;
    return DiscountApproval.create({
      approvalId,
      customerCode,
      requestedDiscountPct,
      approverCode,
      status: requestedDiscountPct > 10 ? "Pending" : "Approved",
    });
  }
}

module.exports = new CRMApprovalEngine();
