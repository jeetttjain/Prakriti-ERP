# Enterprise Finance & Accounting Platform (EFAP) — Overview Documentation

## System Purpose
Phase 7.7 delivers the Enterprise Finance & Accounting Platform (EFAP) for Prakriti ERP under `server/src/core/finance/`. EFAP is the centralized financial backbone enforcing double-entry accounting, general ledger balance management, chart of accounts, AR/AP, Indian GST, financial KPIs, budgeting, fixed assets, and financial reporting.

---

## Core Capabilities
1. **Double-Entry Accounting Engine**: Centralized journal poster (`journalEngine.js`) validating strict `Debit == Credit` balancing across all transactions (`JournalEntry.js`).
2. **Chart of Accounts Directory**: `chartOfAccounts.js` manages standard account codes (`Account.js`) across Assets (1000s), Liabilities (2000s), Equity (3000s), Revenue (4000s), and Expenses (5000s).
3. **General Ledger & Trial Balance**: `ledgerEngine.js` tracks account balances (`GeneralLedger.js`) and validates Trial Balance debit/credit equality.
4. **GST & Tax Calculation Engine**: `gstEngine.js` calculates Intra-state (CGST + SGST) and Inter-state (IGST) Indian GST breakdowns.
5. **AR, AP & Bank Management**: Accounts Receivable (`arManager.js`), Accounts Payable (`apManager.js`), and Cash/Bank accounts (`bankManager.js`).
6. **Financial KPIs & Reporting Suite**: `financialKpiEngine.js` & `financialReportingEngine.js` compute Gross Margin, Net Margin, EBITDA, Working Capital, DSO, DPO, and generate P&L and Balance Sheet reports.
7. **Period Closing & Maker-Checker Approvals**: `periodClosingEngine.js` supports Soft-Close and Hard-Close period locks (`FinancialPeriod.js`).
8. **Event Bus Integration**: Emits `JOURNAL_POSTED`, `PAYMENT_RECEIVED`, `PERIOD_CLOSED` events into the Phase 7.3A Event Bus.
