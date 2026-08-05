# Budget & Variance Engine — Specification

## Budget Model (`Budget.js`)
Tracks departmental and category budgets per fiscal year:
- `allocatedAmount`: Maximum authorized spend budget.
- `spentAmount`: Total posted expenses against the budget.
- `variance`: $\text{Allocated Amount} - \text{Spent Amount}$.
- `status`: `Active`, `Exceeded`, `Closed`.
