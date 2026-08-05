const Account = require("../../../models/Account");
const ledgerEngine = require("../ledger/ledgerEngine");

class FinancialReportingEngine {
  /**
   * Generates Profit & Loss Statement (P&L).
   */
  async getProfitAndLoss() {
    const revenueAccounts = await Account.find({ type: "Revenue" });
    const expenseAccounts = await Account.find({ type: "Expense" });

    const totalRevenue = revenueAccounts.reduce((acc, a) => acc + a.balance, 0);
    const totalExpenses = expenseAccounts.reduce((acc, a) => acc + a.balance, 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      marginPct: totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(2)) : 0,
      revenueBreakdown: revenueAccounts.map(a => ({ code: a.accountCode, name: a.accountName, balance: a.balance })),
      expenseBreakdown: expenseAccounts.map(a => ({ code: a.accountCode, name: a.accountName, balance: a.balance })),
    };
  }

  /**
   * Generates Balance Sheet.
   */
  async getBalanceSheet() {
    const assetAccounts = await Account.find({ type: "Asset" });
    const liabilityAccounts = await Account.find({ type: "Liability" });
    const equityAccounts = await Account.find({ type: "Equity" });

    const totalAssets = assetAccounts.reduce((acc, a) => acc + a.balance, 0);
    const totalLiabilities = liabilityAccounts.reduce((acc, a) => acc + a.balance, 0);
    const totalEquity = equityAccounts.reduce((acc, a) => acc + a.balance, 0);

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
  }

  async getTrialBalance() {
    return ledgerEngine.getTrialBalance();
  }
}

module.exports = new FinancialReportingEngine();
