# Procurement & Goods Receipt Engine — Specification

## Procurement Order Lifecycle (`ProcurementOrder.js`)

```
[ Purchase Order Issued ] ──► [ Goods Receipt at Warehouse ] ──► [ Quality Hold / Inspection ]
                                                                       │
                                                                       ▼
                                                             [ Stock Added to Inventory ]
```
