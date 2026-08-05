const Account = require("../../../models/Account");
const GeneralLedger = require("../../../models/GeneralLedger");

class LedgerEngine {
  /**
   * Posts debit/credit transaction to General Ledger and updates Account balance.
   */
  async postToLedger(accountCode, journalId, debit = 0, credit = 0, narration = "") {
    const account = await Account.findOne({ accountCode });
    if (!account) throw new Error(`Account code ${accountCode} not found in Chart of Accounts.`);

    // Asset/Expense: Debit increases balance, Credit decreases
    // Liability/Equity/Revenue: Credit increases balance, Debit decreases
    let balanceChange = 0;
    if (["Asset", "Expense"].includes(account.type)) {
      balanceChange = debit - credit;
    } else {
      balanceChange = credit - debit;
    }

    account.balance += balanceChange;
    await account.save();

    const ledgerId = `LEDGER-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    return GeneralLedger.create({
      ledgerId,
      accountCode,
      journalId,
      debit,
      credit,
      balance: account.balance,
      narration,
    });
  }

  async getTrialBalance() {
    const accounts = await Account.find({}).sort({ accountCode: 1 });
    let totalDebit = 0;
    let totalCredit = 0;

    const rows = accounts.map((acc) => {
      let debit = 0;
      let credit = 0;
      if (["Asset", "Expense"].includes(acc.type)) {
        if (acc.balance >= 0) debit = acc.balance;
        else credit = Math.abs(acc.balance);
      } else {
        if (acc.balance >= 0) credit = acc.balance;
        else debit = Math.abs(acc.balance);
      }
      totalDebit += debit;
      totalCredit += credit;
      return { accountCode: acc.accountCode, accountName: acc.accountName, type: acc.type, debit, credit };
    });

    return { rows, totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
  }
}

module.exports = new LedgerEngine();
