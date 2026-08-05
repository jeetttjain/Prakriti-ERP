# Recommendation Engine & Lifecycle Registry — Documentation

## Engine Overview
The Recommendation Engine evaluates operational datasets against registered business rules, automatically instantiating structured recommendations stored in MongoDB (`Recommendation` collection).

---

## Recommendation Data Schema

```typescript
interface Recommendation {
  recId: string; // Unique Identifier (e.g. REC-STOCK-LOW-605)
  ruleId: string; // Source Rule ID (e.g. INV_LOW_STOCK_DEPLETION)
  category: 'Sales' | 'Inventory' | 'Customer' | 'Supplier' | 'Finance' | 'Purchase' | 'System';
  severity: 'Critical' | 'Warning' | 'Info' | 'Success';
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  reason: string;
  suggestedAction: string;
  estimatedImpact: string;
  navigationTarget: { path: string; label: string };
  status: 'New' | 'Active' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Archived' | 'Expired';
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
}
```

---

## Lifecycle State Diagram

```
[ New ] ──► [ Active ] ──► [ Acknowledged ] ──► [ In Progress ] ──► [ Resolved ] ──► [ Archived ]
```

- **Active**: Rule condition evaluates as triggered and recommendation requires operational attention.
- **Resolved**: Action completed (`POST /api/bi/recommendation/:id/resolve`).
- **Archived**: Dismissed or superseded (`POST /api/bi/recommendation/:id/archive`).

---

## Drill-Down Navigation Targets
Every recommendation provides a direct path target to prevent manual search:
- **Low Stock Warning** → `/purchases` (Create Purchase Order)
- **Overdue Dues** → `/billing` (Inspect Invoices)
- **Inactive Customer** → `/customers/:id` (Customer Profile)
- **Dead Stock** → `/inventory` (Warehouse Inventory)
