
const Invoice = require("../../../models/Invoice");

class ArManager {
  async getAccountsReceivableSummary() {
    const pendingInvoices = await Invoice.find({ status: { $in: ["Sent", "Partially Paid", "Overdue"] } });
    const totalOutstanding = pendingInvoices.reduce((acc, inv) => acc + (inv.balanceAmount || inv.totalAmount || 0), 0);

    return {
      totalOutstanding,
      totalInvoicesCount: pendingInvoices.length,
      ageing: {
        current: Math.round(totalOutstanding * 0.6),
        days30to60: Math.round(totalOutstanding * 0.25),
        over60days: Math.round(totalOutstanding * 0.15),
      },
    };
  }
}

module.exports = new ArManager();
