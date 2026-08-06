# Warehouse Architecture & Bin Management

## Subsystem Topology
Located under `server/src/core/supplychain/warehouses/warehouseEngine.js`.

---

## Warehouse Schema (`Warehouse.js`)

```typescript
interface Warehouse {
  warehouseCode: string; // e.g. "WH-MAIN-01"
  name: string;
  type: 'Main' | 'Sub' | 'ColdStorage' | 'Transit';
  branchCode: string;
  capacityUnits: number;
  currentUnits: number;
  temperatureCelsius?: number; // Cold storage temperature monitoring
  status: 'Active' | 'Maintenance' | 'Full';
}
```
