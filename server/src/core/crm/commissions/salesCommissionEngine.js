const SalesCommission = require("../../../models/SalesCommission");
const journalEngine = require("../../finance/journal/journalEngine");

class SalesCommissionEngine {
  async calculateCommission(executiveCode, quotationId, orderValue) {
    const commissionId = `COMM-${Date.now()}`;
    const commissionRatePct = 3.5;
    const commissionAmount = (orderValue * commissionRatePct) / 100;

    const commission = await SalesCommission.create({
      commissionId,
      executiveCode,
      quotationId,
      orderValue,
      commissionRatePct,
      commissionAmount,
      status: "Approved",
    });

    // Accrue commission expense journal entries to Phase 7.7 EFAP
    const journalLines = [
      { accountCode: "5000", debit: commissionAmount, credit: 0, description: `Sales Executive Commission Expense (${executiveCode})` },
      { accountCode: "2000", debit: 0, credit: commissionAmount, description: `Sales Commission Payable` },
    ];
    await journalEngine.postJournal(`Sales Commission Accrual for ${executiveCode}`, journalLines, "CRM-ENGINE").catch(() => {});

    return commission;
  }

  async getCommissionsForExecutive(executiveCode = "SALES-EXEC-01") {
    return SalesCommission.find({ executiveCode }).sort({ createdAt: -1 });
  }
}

module.exports = new SalesCommissionEngine();
