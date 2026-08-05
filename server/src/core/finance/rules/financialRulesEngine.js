class FinancialRulesEngine {
  evaluateJournalPostingRules(lines) {
    const totalDebit = lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Double-Entry Rule Violation: Total Debits (${totalDebit}) must equal Total Credits (${totalCredit}).`);
    }

    return { totalDebit, totalCredit, isBalanced: true };
  }
}

module.exports = new FinancialRulesEngine();
