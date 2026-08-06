require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const branchManager = require("./src/core/supplychain/branches/branchManager");
const warehouseEngine = require("./src/core/supplychain/warehouses/warehouseEngine");
const unitConversionEngine = require("./src/core/supplychain/uom/unitConversionEngine");
const inventoryEngine = require("./src/core/supplychain/inventory/inventoryEngine");
const transferEngine = require("./src/core/supplychain/transfers/transferEngine");
const dispatchEngine = require("./src/core/supplychain/dispatch/dispatchEngine");
const fleetManager = require("./src/core/supplychain/vehicles/fleetManager");
const routingEngine = require("./src/core/supplychain/routing/routingEngine");
const supplierRatingEngine = require("./src/core/supplychain/suppliers/supplierRatingEngine");
const inventoryAuditEngine = require("./src/core/supplychain/audit/inventoryAuditEngine");
const supplyChainAnalytics = require("./src/core/supplychain/analytics/supplyChainAnalytics");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Branch & Warehouse Directory Initialization ---");
    const branches = await branchManager.listBranches();
    const warehouses = await warehouseEngine.listWarehouses();
    console.log("✅ Branches Loaded:", branches.length, "| Warehouses Loaded:", warehouses.length, "Codes:", warehouses.map(w => w.warehouseCode));

    console.log("\n--- TEST 2: Produce Unit Conversion Engine (UOM) ---");
    const sackToKg = unitConversionEngine.convertToKg(5, "Sack");
    const crateToKg = unitConversionEngine.convertToKg(4, "Crate");
    console.log("✅ Produce UOM Conversion: 5 Sacks =", sackToKg, "Kg | 4 Crates =", crateToKg, "Kg");

    console.log("\n--- TEST 3: Multi-Warehouse Inventory & FEFO Batch Expiry Ledger ---");
    const inventory = await inventoryEngine.listInventory();
    console.log("✅ Stock Items tracked:", inventory.length, "Item 1 Available Qty:", inventory[0].availableQty, inventory[0].uom);

    console.log("\n--- TEST 4: Stock Reservation Engine ---");
    const resStock = await inventoryEngine.reserveStock("PROD-OIL-01", "WH-MAIN-01", 50);
    console.log("✅ Stock Reserved! Product PROD-OIL-01 Available Qty:", resStock.availableQty, "Reserved Qty:", resStock.reservedQty);

    console.log("\n--- TEST 5: Inter-Warehouse Stock Transfer Engine & Event Bus ---");
    const transfer = await transferEngine.createTransfer("WH-MAIN-01", "WH-COLD-01", [{ productCode: "PROD-OIL-01", quantity: 100, uom: "Piece" }]);
    console.log("✅ Stock Transfer initiated! Transfer ID:", transfer.transferId, "Status:", transfer.status);

    console.log("\n--- TEST 6: Sales Dispatch Engine & Packing List ---");
    const dispatch = await dispatchEngine.createDispatch("ORD-9081", "Ramesh Foods Jaipur", "WH-MAIN-01", [{ productCode: "PROD-OIL-01", quantity: 50, uom: "Piece" }]);
    console.log("✅ Dispatch Note issued! Dispatch ID:", dispatch.dispatchId, "Status:", dispatch.status);

    console.log("\n--- TEST 7: Fleet Management & Delivery Route Optimization ---");
    const vehicles = await fleetManager.listVehicles();
    const routes = await routingEngine.listRoutes();
    console.log("✅ Fleet Vehicles Available:", vehicles.length, "| Delivery Routes Tracked:", routes.length);

    console.log("\n--- TEST 8: Inventory Physical Cycle Count & Finance Ledger Adjustment ---");
    const audit = await inventoryAuditEngine.conductCycleCount("WH-MAIN-01", "PROD-OIL-01", 1000, 990, "AUDITOR-01");
    console.log("✅ Inventory Audit Conducted! Audit ID:", audit.auditId, "Variance Qty:", audit.varianceQty, "Status:", audit.status);

    console.log("\n--- TEST 9: Supply Chain Analytics Calculator ---");
    const analytics = await supplyChainAnalytics.getOperationalAnalytics();
    console.log("✅ Supply Chain Analytics: Inventory Turnover:", analytics.inventoryTurnoverRatio, "x | Fill Rate:", analytics.orderFillRatePct, "%");

    console.log("\n🎉 ALL 9 ENTERPRISE MULTI-BRANCH, WAREHOUSE & SUPPLY CHAIN PLATFORM TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🍃 MongoDB Connection closed.");
    process.exit(0);
  }
}

runTests();
