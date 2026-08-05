# Workflow Engine & Step Architecture — Technical Blueprint

## Architecture Overview
The Workflow Engine (`server/src/core/workflows/`) executes versioned workflow step chains stored in MongoDB (`WorkflowDef` collection).

---

## Step Execution Chain

```
[ Trigger ] ──► [ Condition ] ──► [ Action ] ──► [ Delay ] ──► [ Finish ]
                      │
                      └──► (Else Branch)
```

---

## Workflow Status Lifecycle
- **Draft**: Initial un-published state.
- **Published**: Active for event triggering.
- **Deprecated**: Replaced by newer version.
- **Archived**: De-activated and stored for audit log history.

---

## Pre-Packaged Templates (`workflowTemplates.js`)
1. **TMPL_PAYMENT_REMINDER**: Follows up on overdue invoices.
2. **TMPL_LOW_STOCK_ALERT**: Generates reorder alerts when inventory depletes below threshold.
3. **TMPL_DAILY_BACKUP**: Triggers daily automated database backups.
