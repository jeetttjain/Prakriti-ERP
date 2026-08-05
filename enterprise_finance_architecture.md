# Enterprise Finance Architecture — Full Technical Blueprint

## 1. Executive Summary
Phase 7.7 establishes the Enterprise Finance & Accounting Platform (EFAP) for Prakriti ERP. EFAP is the centralized double-entry accounting engine responsible for general ledger balances, chart of accounts, AR/AP, Indian GST, financial KPIs, budgeting, fixed assets, and financial reporting across all ERP modules.

---

## 2. Component Topology Diagram

```mermaid
flowchart TD
    A[Sales / Purchases / Expenses / Invoices / Payments] -->|1. Post Financial Transaction| B[journalEngine.js & financialRulesEngine.js]
    B -->|2. Validate Debit == Credit| C[JournalEntry Collection]
    B -->|3. Post Lines to Ledger| D[ledgerEngine.js & Account Collection]
    D -->|4. Compute Balances| E[GeneralLedger Collection]
    B -->|5. Calculate GST & Taxes| F[gstEngine.js]
    D -->|6. Calculate Financial KPIs & Reports| G[financialKpiEngine.js & financialReportingEngine.js]
    G -->|7. Display Telemetry| H[Enterprise Finance Console UI]
    B -->|8. Emit Financial Events| I[Event Bus: JOURNAL_POSTED / PERIOD_CLOSED]
```

---

## 3. Financial Event & System Integration
- **Event Bus**: Emits `JOURNAL_POSTED`, `PAYMENT_RECEIVED`, `PERIOD_CLOSED`, `BUDGET_UPDATED` events to the Phase 7.3A Event Bus.
- **Business Intelligence**: P&L, EBITDA, Working Capital, and margin telemetry feed directly into Executive Dashboards and BI Engine.
- **Communication Engine**: Dispatches period closing alerts and high-value payment notifications automatically.

---

## 4. Payment Gateway Readiness
Prepared provider registry (`paymentGatewayRegistry.js`) for future payment gateway integrations:
- Razorpay / PhonePe / Cashfree (India)
- Stripe / PayPal (Global)
