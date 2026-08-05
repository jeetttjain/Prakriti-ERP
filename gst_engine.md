# Indian GST & Tax Engine — Specification

## Tax Calculation Logic (`gstEngine.js`)

```
[ Invoice Subtotal: ₹10,000 | Tax Rate: 18% ]
                    │
           ┌────────┴────────┐
           ▼                 ▼
   (Intra-State)       (Inter-State)
   CGST (9%): ₹900     IGST (18%): ₹1,800
   SGST (9%): ₹900     CGST: ₹0, SGST: ₹0
   Total: ₹11,800      Total: ₹11,800
```
