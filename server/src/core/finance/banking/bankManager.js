const BankAccount = require("../../../models/BankAccount");

class BankManager {
  async initializeDefaults() {
    const count = await BankAccount.countDocuments();
    if (count > 0) return;

    await BankAccount.create([
      { bankId: "BANK-01", bankName: "HDFC Main Corporate Account", accountNumber: "50200012345678", ifscCode: "HDFC0001234", balance: 1250000 },
      { bankId: "CASH-01", bankName: "Petty Cash Account", accountNumber: "CASH-001", accountType: "Cash", balance: 45000 },
    ]);
  }

  async listBankAccounts() {
    await this.initializeDefaults();
    return BankAccount.find({});
  }
}

module.exports = new BankManager();
