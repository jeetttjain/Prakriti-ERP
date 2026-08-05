# Finance Platform — API Reference

## Endpoints Specifications (`/api/finance/*`)

### 1. `GET /api/finance/accounts`
Returns Chart of Accounts list.

### 2. `GET /api/finance/ledger`
Returns General Ledger transaction records.

### 3. `GET /api/finance/journals`
Returns double-entry Journal entries.

### 4. `GET /api/finance/payments`
Returns financial payments.

### 5. `GET /api/finance/reports`
Generates P&L, Balance Sheet, Trial Balance, KPIs, AR/AP summaries.

### 6. `GET /api/finance/budget`
Returns department budgets and spent variances.

### 7. `GET /api/finance/assets`
Returns registered fixed assets.

### 8. `POST /api/finance/journal`
Posts a double-entry journal entry. Enforces `Debit == Credit`.

### 9. `POST /api/finance/payment`
Records a payment transaction.

### 10. `POST /api/finance/reconciliation`
Executes bank statement reconciliation.

### 11. `POST /api/finance/closing`
Executes Month-End or Year-End period closing (`SoftClosed` / `HardClosed`).

### 12. `PATCH /api/finance/budget`
Updates budget allocation amounts.

### 13. `DELETE /api/finance/journal/:id`
Cancels a posted journal entry.
