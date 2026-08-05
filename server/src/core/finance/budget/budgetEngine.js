const Budget = require("../../../models/Budget");

class BudgetEngine {
  async initializeDefaults() {
    const count = await Budget.countDocuments();
    if (count > 0) return;

    await Budget.create([
      { budgetId: "BDG-OPS-01", department: "Operations", category: "Logistics & Transport", fiscalYear: "2026-2027", allocatedAmount: 500000, spentAmount: 184000 },
      { budgetId: "BDG-MKT-01", department: "Marketing", category: "Digital Campaigns", fiscalYear: "2026-2027", allocatedAmount: 300000, spentAmount: 95000 },
    ]);
  }

  async listBudgets() {
    await this.initializeDefaults();
    return Budget.find({});
  }
}

module.exports = new BudgetEngine();
