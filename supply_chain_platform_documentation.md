# Enterprise Multi-Branch, Warehouse & Supply Chain Platform (EMSCP) — Overview Documentation

## System Purpose
Phase 7.8 delivers the Enterprise Multi-Branch, Warehouse & Supply Chain Platform (EMSCP) for Prakriti ERP under `server/src/core/supplychain/`. EMSCP is the single source of truth for regional branch hierarchies, multi-warehouse management, produce UOM conversion (Kg, Sack, Box, Crate), stock reservation, inter-warehouse transfers, procurement receiving, sales dispatch notes, vehicle fleet management, delivery route planning, and supplier performance rating.

---

## Core Capabilities
1. **Branch & Regional Cluster Manager**: `branchManager.js` handles branch code mapping (`Branch.js`), regions, and regional managers.
2. **Multi-Warehouse & Bin Engine**: `warehouseEngine.js` manages Main, Sub, Cold Storage (4°C), and Transit warehouses (`Warehouse.js`) with bin capacity tracking.
3. **Produce Unit Conversion Engine**: `unitConversionEngine.js` converts agricultural produce UOMs (1 Sack = 50 Kg, 1 Box = 12 Pieces, 1 Crate = 25 Kg).
4. **Real-time Inventory Ledger & Stock Reservations**: `inventoryEngine.js` tracks Available, Reserved, Committed, and Transit stock (`InventoryStock.js`) with FEFO batch expiry rules.
5. **Stock Transfers & Sales Dispatch**: `transferEngine.js` handles inter-warehouse stock transfer orders (`StockTransfer.js`). `dispatchEngine.js` handles sales dispatches and packing lists (`DispatchNote.js`).
6. **Fleet Management & Route Optimization**: `fleetManager.js` & `routingEngine.js` manage vehicle fleet (`Vehicle.js`) and delivery routes (`DeliveryRoute.js`).
7. **Physical Cycle Count Audit & Finance Integration**: `inventoryAuditEngine.js` conducts stock cycle counts and posts double-entry stock variance adjustments directly to Phase 7.7 EFAP.
8. **Event Bus Integration**: Emits `STOCK_TRANSFERRED`, `DISPATCH_CREATED`, `RECEIVING_COMPLETED`, and `STOCK_RESERVED` events into the Phase 7.3A Event Bus.
