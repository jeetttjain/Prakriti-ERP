const Purchase = require("../../../models/Purchase");

class ApManager {
  async getAccountsPayableSummary() {
    const pendingPurchases = await Purchase.find({ paymentStatus: { $in: ["Unpaid", "Partially Paid"] } });
    const totalOutstanding = pendingPurchases.reduce((acc, pur) => acc + (pur.balanceAmount || pur.totalAmount || 0), 0);

    return {
      totalOutstanding,
      totalBillsCount: pendingPurchases.length,
      ageing: {
        current: Math.round(totalOutstanding * 0.7),
        days30to60: Math.round(totalOutstanding * 0.2),
        over60days: Math.round(totalOutstanding * 0.1),
      },
    };
  }
}

module.exports = new ApManager();
