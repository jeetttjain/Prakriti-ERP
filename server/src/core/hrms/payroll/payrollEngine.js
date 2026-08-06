const PayrollRun = require("../../../models/PayrollRun");
const SalaryStructure = require("../../../models/SalaryStructure");
const journalEngine = require("../../finance/journal/journalEngine");
const eventPublisher = require("../../events/eventPublisher");

class PayrollEngine {
  async initializeDefaults() {
    const count = await SalaryStructure.countDocuments();
    if (count > 0) return;

    await SalaryStructure.create([
      { employeeCode: "EMP-001", basicSalary: 120000, hra: 40000, allowances: 20000, pfDeduction: 14400, esiDeduction: 0, tdsDeduction: 15000, netSalary: 150600 },
      { employeeCode: "EMP-002", basicSalary: 80000, hra: 25000, allowances: 15000, pfDeduction: 9600, esiDeduction: 0, tdsDeduction: 8000, netSalary: 102400 },
    ]);
  }

  async listPayrollRuns() {
    await this.initializeDefaults();
    return PayrollRun.find({}).sort({ createdAt: -1 });
  }

  async runMonthlyPayroll(month = 8, year = 2026, userCode = "HR-ADMIN") {
    await this.initializeDefaults();
    const structures = await SalaryStructure.find({});

    let totalGross = 0;
    let totalNet = 0;
    for (const s of structures) {
      totalGross += (s.basicSalary + s.hra + s.allowances);
      totalNet += s.netSalary;
    }

    const payrollRunId = `PAY-${year}-${month}-${Date.now().toString().slice(-4)}`;
    const payrollRun = await PayrollRun.create({
      payrollRunId,
      month,
      year,
      employeeCount: structures.length,
      totalGross,
      totalNet,
      status: "Completed",
    });

    // Post double-entry salary expense journal entries into Phase 7.7 EFAP
    const journalLines = [
      { accountCode: "5000", debit: totalGross, credit: 0, description: `Monthly Salary Expense (${month}/${year})` },
      { accountCode: "2000", debit: 0, credit: totalNet, description: `Salaries Payable` },
      { accountCode: "2100", debit: 0, credit: totalGross - totalNet, description: `TDS/PF Statutory Liabilities` },
    ];

    await journalEngine.postJournal(`Payroll Processing Run for ${month}/${year}`, journalLines, userCode).catch(() => {});

    eventPublisher.publish("PAYROLL_COMPLETED", { payrollRunId, totalGross, totalNet, employeeCount: structures.length }, { producerModule: "EHRMP" }).catch(() => {});

    return payrollRun;
  }
}

module.exports = new PayrollEngine();
