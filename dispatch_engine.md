# Sales Dispatch & Packing List Engine — Specification

## Dispatch Flow (`DispatchNote.js` & `dispatchEngine.js`)
1. **Packing List Generation**: Maps customer sales order items to warehouse stock bins.
2. **Vehicle & Driver Assignment**: Assigns delivery vehicle (`Vehicle.js`) and driver.
3. **Dispatch Emission**: Emits `DISPATCH_CREATED` event to Event Bus and updates stock status from Reserved to Dispatched.
