# Inventory Engine & Produce Conversion Specification

## Unit Conversion Engine (`unitConversionEngine.js`)

```
[ Produce Item Received ]
            │
   ┌────────┴────────┐
   ▼                 ▼
 1 Sack = 50 Kg    1 Box = 12 Pieces
 1 Crate = 25 Kg   1 Ton = 1,000 Kg
```

---

## Inventory Stock Ledger (`InventoryStock.js`)

```typescript
interface InventoryStock {
  stockId: string;
  productCode: string;
  warehouseCode: string;
  availableQty: number;
  reservedQty: number;
  transitQty: number;
  uom: string;
  batchNumber?: string;
  expiryDate?: Date; // FEFO perishable tracking
  unitCost: number;
}
```
