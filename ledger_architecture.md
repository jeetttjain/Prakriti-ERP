# General Ledger & Chart of Accounts Architecture

## Chart of Accounts Structure (`Account.js`)

```typescript
interface Account {
  accountCode: string; // e.g. "1001"
  accountName: string; // e.g. "Cash in Hand"
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  category: string;
  balance: number;
  currency: string;
  isActive: boolean;
}
```

---

## Balance Calculation Rules
- **Assets & Expenses**: $\text{New Balance} = \text{Current Balance} + (\text{Debit} - \text{Credit})$
- **Liabilities, Equity & Revenue**: $\text{New Balance} = \text{Current Balance} + (\text{Credit} - \text{Debit})$
