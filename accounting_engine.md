# Accounting Engine & Double-Entry Specification

## Double-Entry Posting Flow
Located under `server/src/core/finance/journal/journalEngine.js` and `rules/financialRulesEngine.js`.

```
[ Financial Transaction Request ]
                │
                ▼
  [ financialRulesEngine.js ] ──► (Verify Total Debits == Total Credits)
                │
                ▼
     [ journalEngine.js ] ──► (Create JournalEntry Document)
                │
                ▼
     [ ledgerEngine.js ] ──► (Post Debit/Credit Lines to General Ledger)
                │
                ▼
    [ Event Bus Event: JOURNAL_POSTED ]
```

---

## Double-Entry Validation Rule
Every journal transaction must satisfy:
$$\sum \text{Debits} = \sum \text{Credits}$$

If $\Delta > 0.01$, the transaction is rejected immediately with `Double-Entry Rule Violation`.
