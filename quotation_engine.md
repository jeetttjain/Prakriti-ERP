# Quotation Engine & Omnichannel Dispatch — Specification

## Quotation Workflow (`Quotation.js` & `quotationEngine.js`)

```
[ Create Quotation ] ──► [ Calculate GST Tax & Discount ]
                                   │
                                   ▼
                  [ Dispatch PDF / Email / WhatsApp via Phase 7.3B ]
                                   │
                                   ▼
                  [ Emit Event Bus: QUOTATION_CREATED ]
```
