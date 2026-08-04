const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");
const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const { validateProduct } = require("../services/validation.service");
const { successResponse, errorResponse, paginatedResponse } = require("../services/response.service");
const { getPagination } = require("../services/pagination.service");
const { executeTransaction } = require("../services/transaction.service");
const inventoryService = require("../services/inventory.service");
const cache = require("../services/cache.service");
const { invalidateReportCaches } = cache;

// CREATE OPENING STOCK
exports.createOpeningStock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const inventory = await executeTransaction(async (session) => {
      return await inventoryService.createInventory(req.body, session);
    });

    invalidateReportCaches();
    return successResponse(res, inventory, "Opening stock created successfully.", 201);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET INVENTORY LIST (PAGINATED & FILTERED)
exports.getInventory = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query, { inventoryCode: 1 });

    const filter = {};
    if (req.query.status) {
      filter.stockStatus = req.query.status;
    }
    if (req.query.location) {
      filter.location = req.query.location;
    }

    const inventory = await Inventory.find(filter)
      .populate("productId", "productName category productCode unit sellingPrice")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments(filter);

    return paginatedResponse(res, inventory, page, limit, total, "totalInventory");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET INVENTORY BY ID / PRODUCT ID
exports.getInventoryById = async (req, res) => {
  try {
    let inventory = await Inventory.findById(req.params.id)
      .populate("productId", "productName category productCode unit sellingPrice");

    // Fallback: search by productId if ID query fails
    if (!inventory) {
      inventory = await Inventory.findOne({ productId: req.params.id })
        .populate("productId", "productName category productCode unit sellingPrice");
    }

    if (!inventory) {
      return errorResponse(res, "Inventory record not found.", 404);
    }

    return successResponse(res, inventory);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// ADJUST INVENTORY STOCK LEVEL
exports.adjustInventory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const { productId, newStockValue, remarks, movementReason, createdBy } = req.body;

    const inventory = await executeTransaction(async (session) => {
      return await inventoryService.adjustStock(
        productId,
        newStockValue,
        remarks || "Manual stock correction adjustment",
        movementReason || "Correction",
        createdBy,
        session
      );
    });

    invalidateReportCaches();
    return successResponse(res, inventory, "Inventory stock level adjusted successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// RESERVE INVENTORY STOCK
exports.reserveInventory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const { productId, quantity, remarks, movementReason, createdBy } = req.body;

    const inventory = await executeTransaction(async (session) => {
      return await inventoryService.reserveStock(
        productId,
        quantity,
        "Manual",
        null,
        "",
        remarks || "Manual stock reservation",
        movementReason || "Stock Audit",
        createdBy,
        session
      );
    });

    invalidateReportCaches();
    return successResponse(res, inventory, "Stock reserved successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// RELEASE INVENTORY RESERVATION
exports.releaseReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const { productId, quantity, remarks, movementReason, createdBy } = req.body;

    const inventory = await executeTransaction(async (session) => {
      return await inventoryService.releaseReservedStock(
        productId,
        quantity,
        "Manual",
        null,
        "",
        remarks || "Manual reservation release",
        movementReason || "Stock Audit",
        createdBy,
        session
      );
    });

    cache.delete(DASHBOARD_CACHE_KEY);
    return successResponse(res, inventory, "Reservation released successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SEARCH INVENTORY
exports.searchInventory = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    const matchingProducts = await Product.find({
      $or: [
        { productName: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { productCode: { $regex: keyword, $options: "i" } },
      ],
    }).select("_id");

    const productIds = matchingProducts.map((p) => p._id);

    const inventory = await Inventory.find({
      $or: [
        { productId: { $in: productIds } },
        { inventoryCode: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
        { batchNumber: { $regex: keyword, $options: "i" } },
      ],
    }).populate("productId", "productName category productCode unit sellingPrice");

    return successResponse(res, inventory);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET STOCK MOVEMENT HISTORY (PAGINATED)
exports.getMovementHistory = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query, { createdAt: -1 });

    const filter = {};
    if (req.query.productId) {
      filter.productId = req.query.productId;
    }
    if (req.query.inventoryId) {
      filter.inventoryId = req.query.inventoryId;
    }
    if (req.query.type) {
      filter.movementType = req.query.type;
    }
    if (req.query.module) {
      filter.referenceModule = req.query.module;
    }

    const movements = await StockMovement.find(filter)
      .populate("productId", "productName productCode unit")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await StockMovement.countDocuments(filter);

    return paginatedResponse(res, movements, page, limit, total, "totalMovements");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
