const Account = require("../../../models/Account");

class ChartOfAccounts {
  /**
   * Initializes standard Chart of Accounts if empty.
   */
  async initializeDefaults() {
    const count = await Account.countDocuments();
    if (count > 0) return;

    const defaultAccounts = [
      { accountCode: "1001", accountName: "Cash in Hand", type: "Asset", category: "Cash" },
      { accountCode: "1002", accountName: "HDFC Main Bank Account", type: "Asset", category: "Bank" },
      { accountCode: "1100", accountName: "Accounts Receivable (Customers)", type: "Asset", category: "Receivable" },
      { accountCode: "1200", accountName: "Inventory Assets", type: "Asset", category: "Inventory" },
      { accountCode: "2000", accountName: "Accounts Payable (Suppliers)", type: "Liability", category: "Payable" },
      { accountCode: "2100", accountName: "GST Payable (Output Tax)", type: "Liability", category: "Tax" },
      { accountCode: "3000", accountName: "Owner's Equity Capital", type: "Equity", category: "Equity" },
      { accountCode: "4000", accountName: "Sales Revenue", type: "Revenue", category: "Revenue" },
      { accountCode: "5000", accountName: "Cost of Goods Sold (COGS)", type: "Expense", category: "Cost" },
      { accountCode: "5100", accountName: "Operating Expenses", type: "Expense", category: "Expense" },
    ];

    await Account.insertMany(defaultAccounts);
  }

  async getAccount(accountCode) {
    return Account.findOne({ accountCode });
  }

  async listAccounts() {
    await this.initializeDefaults();
    return Account.find({}).sort({ accountCode: 1 });
  }
}

module.exports = new ChartOfAccounts();
