# Financial Reporting Engine — Specification

## Reports Generated (`financialReportingEngine.js`)
1. **Trial Balance**: Validates total debits equal total credits across all active accounts.
2. **Profit & Loss Statement (P&L)**:
   $$\text{Net Profit} = \sum \text{Revenue Balances} - \sum \text{Expense Balances}$$
3. **Balance Sheet**:
   $$\text{Total Assets} = \text{Total Liabilities} + \text{Total Equity}$$
4. **Financial KPIs (`financialKpiEngine.js`)**: Gross Margin %, Net Margin %, EBITDA, Working Capital, DSO, DPO.
