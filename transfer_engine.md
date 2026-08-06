# Inter-Warehouse Stock Transfer Engine — Specification

## Transfer Order Flow (`StockTransfer.js` & `transferEngine.js`)

```
[ Request Transfer ] ──► [ Source Warehouse (Deduct Available, Add Transit) ]
                                      │
                               (In-Transit Ship)
                                      ▼
                        [ Destination Warehouse (Deduct Transit, Add Available) ]
```
