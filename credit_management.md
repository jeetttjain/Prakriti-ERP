# Credit Control & Collection Management — Specification

## Credit Control & Collection Engine (`CreditProfile.js`, `Collection.js` & `collectionEngine.js`)

```
[ Collection Payment Receipt ]
               │
               ▼
[ Update Customer Outstanding Balance ]
               │
               ▼
[ Post Double-Entry Ledger Entry to Phase 7.7 Finance (EFAP) ]
  • Debit  1000: Bank / Cash Account (Amount)
  • Credit 1100: Accounts Receivable (Clearance)
```
