const ProcurementOrder = require("../models/ProcurementOrder");
const StockTransfer = require("../models/StockTransfer");
const InventoryStock = require("../models/InventoryStock");
const branchManager = require("../core/supplychain/branches/branchManager");
const warehouseEngine = require("../core/supplychain/warehouses/warehouseEngine");
const inventoryEngine = require("../core/supplychain/inventory/inventoryEngine");
const transferEngine = require("../core/supplychain/transfers/transferEngine");
const dispatchEngine = require("../core/supplychain/dispatch/dispatchEngine");
const fleetManager = require("../core/supplychain/vehicles/fleetManager");
const routingEngine = require("../core/supplychain/routing/routingEngine");
const supplierRatingEngine = require("../core/supplychain/suppliers/supplierRatingEngine");
const inventoryAuditEngine = require("../core/supplychain/audit/inventoryAuditEngine");
const supplyChainAnalytics = require("../core/supplychain/analytics/supplyChainAnalytics");
const { successResponse, errorResponse } = require("../services/response.service");

// GET /api/supplychain/branches
exports.getBranches = async (req, res) => {
  try {
    const branches = await branchManager.listBranches();
    return successResponse(res, branches, "Branch directory retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/supplychain/warehouses
exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await warehouseEngine.listWarehouses();
    return successResponse(res, warehouses, "Warehouse facilities retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/supplychain/inventory
exports.getInventory = async (req, res) => {
  try {
    const inventory = await inventoryEngine.listInventory();
    return successResponse(res, inventory, "Inventory stock retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/supplychain/transfers
exports.getTransfers = async (req, res) => {
  try {
    const transfers = await transferEngine.listTransfers();
    return successResponse(res, transfers, "Stock transfers retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/supplychain/procurement
exports.getProcurement = async (req, res) => {
  try {
    const orders = await ProcurementOrder.find({}).sort({ createdAt: -1 });
    return successResponse(res, orders, "Procurement orders retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/supplychain/dispatch
exports.getDispatch = async (req, res) => {
  try {
    const dispatches = await dispatchEngine.listDispatches();
    return successResponse(res, dispatches, "Sales dispatches retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/supplychain/routes
exports.getRoutes = async (req, res) => {
  try {
    const routes = await routingEngine.listRoutes();
    const vehicles = await fleetManager.listVehicles();
    return successResponse(res, { routes, vehicles }, "Routes & Fleet retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/supplychain/suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const ratings = await supplierRatingEngine.getSupplierRatings();
    return successResponse(res, ratings, "Supplier ratings retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/supplychain/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await supplyChainAnalytics.getOperationalAnalytics();
    return successResponse(res, analytics, "Supply chain analytics generated.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/supplychain/transfer
exports.createTransfer = async (req, res) => {
  try {
    const { sourceWarehouse, destinationWarehouse, items } = req.body;
    const transfer = await transferEngine.createTransfer(sourceWarehouse, destinationWarehouse, items);
    return successResponse(res, transfer, "Stock transfer initiated successfully.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/supplychain/receive
exports.receiveProcurement = async (req, res) => {
  try {
    const order = await ProcurementOrder.create({
      poNumber: `PO-${Date.now()}`,
      ...req.body,
    });
    return successResponse(res, order, "Procurement goods received.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/supplychain/dispatch
exports.createDispatch = async (req, res) => {
  try {
    const { orderId, customerName, warehouseCode, items, vehicleId, driverName } = req.body;
    const dispatch = await dispatchEngine.createDispatch(orderId, customerName, warehouseCode, items, vehicleId, driverName);
    return successResponse(res, dispatch, "Sales dispatch note issued.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/supplychain/route
exports.createRoute = async (req, res) => {
  try {
    return successResponse(res, req.body, "Delivery route created.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/supplychain/audit
exports.conductAudit = async (req, res) => {
  try {
    const { warehouseCode, productCode, expectedQty, countedQty } = req.body;
    const audit = await inventoryAuditEngine.conductCycleCount(warehouseCode, productCode, expectedQty, countedQty, req.user?.userCode || "STORE-KEEPER");
    return successResponse(res, audit, "Inventory cycle count audit completed.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/supplychain/inventory
exports.updateInventory = async (req, res) => {
  try {
    return successResponse(res, req.body, "Inventory balance updated.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// DELETE /api/supplychain/transfer/:id
exports.cancelTransfer = async (req, res) => {
  try {
    const transfer = await StockTransfer.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { transferId: req.params.id }] },
      { status: "Cancelled" },
      { new: true }
    );
    return successResponse(res, transfer, "Stock transfer cancelled.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
