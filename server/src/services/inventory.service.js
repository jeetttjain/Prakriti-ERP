const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");
const Product = require("../models/Product");

/**
 * Calculates available stock volume.
 * @param {number} currentStock
 * @param {number} reservedStock
 * @returns {number}
 */
const calculateAvailableStock = (currentStock, reservedStock) => {
  return (Number(currentStock) || 0) - (Number(reservedStock) || 0);
};

/**
 * Determines stock status based on current levels and thresholds.
 * @param {number} currentStock
 * @param {number} minimumStock
 * @param {number} reorderLevel
 * @returns {string} 'In Stock' | 'Low Stock' | 'Out Of Stock'
 */
const updateStockStatus = (currentStock, minimumStock = 0, reorderLevel = 0) => {
  const current = Number(currentStock) || 0;
  const min = Number(minimumStock) || 0;
  const reorder = Number(reorderLevel) || 0;

  if (current === 0) {
    return "Out Of Stock";
  }
  if (current <= min || current <= reorder) {
    return "Low Stock";
  }
  return "In Stock";
};

/**
 * Centralized helper to recalculate, update movement date, and save inventory.
 * @param {string} productId MongoDB ID of the Product
 * @param {object} [session=null]
 */
const recalculateInventory = async (productId, session = null) => {
  const inventory = await Inventory.findOne({ productId }).session(session);
  if (!inventory) {
    const error = new Error("Inventory record not found.");
    error.statusCode = 404;
    throw error;
  }

  inventory.availableStock = calculateAvailableStock(inventory.currentStock, inventory.reservedStock);
  inventory.stockStatus = updateStockStatus(inventory.currentStock, inventory.minimumStock, inventory.reorderLevel);
  inventory.lastMovementDate = new Date();

  await inventory.save({ session });
  return inventory;
};

/**
 * Creates and records a stock movement entry.
 */
const recordMovement = async (
  productId,
  inventoryId,
  movementType,
  quantity,
  previousStock,
  newStock,
  referenceModule,
  referenceId = null,
  referenceNumber = "",
  remarks = "",
  movementReason = "",
  createdBy = null,
  session = null
) => {
  const movement = new StockMovement({
    productId,
    inventoryId,
    movementType,
    quantity,
    previousStock,
    newStock,
    referenceModule,
    referenceId,
    referenceNumber,
    movementReason,
    remarks,
    createdBy,
  });

  await movement.save({ session });
  return movement;
};

/**
 * Creates the initial inventory record for a product (Opening Stock).
 */
const createInventory = async (data, session = null) => {
  const {
    productId,
    currentStock = 0,
    minimumStock = 0,
    reorderLevel = 0,
    maximumStock = 0,
    location = "Main Warehouse",
    batchNumber = "",
    expiryDate = null,
    remarks = "",
    createdBy = null,
  } = data;

  // Check if inventory already exists for product
  const existing = await Inventory.findOne({ productId }).session(session);
  if (existing) {
    const error = new Error("Inventory record already exists for this product.");
    error.statusCode = 409;
    throw error;
  }

  // Fetch product unit
  const product = await Product.findById(productId).session(session);
  if (!product) {
    const error = new Error(`Product with ID ${productId} not found.`);
    error.statusCode = 404;
    throw error;
  }

  const inventory = new Inventory({
    productId,
    currentStock,
    reservedStock: 0,
    availableStock: currentStock,
    openingStock: currentStock,
    minimumStock,
    reorderLevel,
    maximumStock,
    stockUnit: product.unit,
    stockStatus: updateStockStatus(currentStock, minimumStock, reorderLevel),
    location,
    batchNumber,
    expiryDate,
    remarks,
    createdBy,
    lastMovementDate: new Date(),
  });

  await inventory.save({ session });

  // Record opening stock movement
  await recordMovement(
    productId,
    inventory._id,
    "Opening Stock",
    currentStock,
    0,
    currentStock,
    "Inventory",
    inventory._id,
    inventory.inventoryCode,
    remarks || "Initial opening stock setup",
    "Manual Entry",
    createdBy,
    session
  );

  return inventory;
};

/**
 * Increases the stock level of a product.
 */
const increaseStock = async (
  productId,
  quantity,
  referenceModule,
  referenceId = null,
  referenceNumber = "",
  remarks = "",
  movementReason = "",
  createdBy = null,
  session = null
) => {
  const inventory = await Inventory.findOne({ productId }).session(session);
  if (!inventory) {
    const error = new Error("Inventory record not found.");
    error.statusCode = 404;
    throw error;
  }

  const previousStock = inventory.currentStock;
  const newStock = previousStock + Number(quantity);

  inventory.currentStock = newStock;
  await inventory.save({ session });

  const updatedInventory = await recalculateInventory(productId, session);

  let type = "Manual Adjustment";
  if (referenceModule === "Purchase") type = "Purchase";
  if (referenceModule === "Order") type = "Return";

  await recordMovement(
    productId,
    inventory._id,
    type,
    Number(quantity),
    previousStock,
    newStock,
    referenceModule,
    referenceId,
    referenceNumber,
    remarks,
    movementReason || (type === "Return" ? "Customer Return" : "Transfer"),
    createdBy,
    session
  );

  return updatedInventory;
};

/**
 * Decreases the stock level of a product.
 */
const decreaseStock = async (
  productId,
  quantity,
  referenceModule,
  referenceId = null,
  referenceNumber = "",
  remarks = "",
  movementReason = "",
  createdBy = null,
  session = null,
  isFromReserved = false
) => {
  const inventory = await Inventory.findOne({ productId }).session(session);
  if (!inventory) {
    const error = new Error("Inventory record not found.");
    error.statusCode = 404;
    throw error;
  }

  const qty = Number(quantity);
  if (inventory.currentStock < qty) {
    const error = new Error("Insufficient stock available.");
    error.statusCode = 400;
    throw error;
  }

  if (isFromReserved) {
    if (inventory.reservedStock < qty) {
      const error = new Error("Insufficient reserved stock available.");
      error.statusCode = 400;
      throw error;
    }
    inventory.reservedStock -= qty;
  }

  const previousStock = inventory.currentStock;
  const newStock = previousStock - qty;

  inventory.currentStock = newStock;
  await inventory.save({ session });

  const updatedInventory = await recalculateInventory(productId, session);

  let type = "Manual Adjustment";
  if (referenceModule === "Order") type = "Delivery";

  await recordMovement(
    productId,
    inventory._id,
    type,
    qty,
    previousStock,
    newStock,
    referenceModule,
    referenceId,
    referenceNumber,
    remarks,
    movementReason || (type === "Delivery" ? "Customer Order" : "Damage"),
    createdBy,
    session
  );

  return updatedInventory;
};

/**
 * Reserves stock for an order.
 */
const reserveStock = async (
  productId,
  quantity,
  referenceModule,
  referenceId = null,
  referenceNumber = "",
  remarks = "",
  movementReason = "",
  createdBy = null,
  session = null
) => {
  const inventory = await Inventory.findOne({ productId }).session(session);
  if (!inventory) {
    const error = new Error("Inventory record not found.");
    error.statusCode = 404;
    throw error;
  }

  const qty = Number(quantity);
  const available = calculateAvailableStock(inventory.currentStock, inventory.reservedStock);
  if (available < qty) {
    const error = new Error("Insufficient available stock to reserve.");
    error.statusCode = 400;
    throw error;
  }

  const previousStock = inventory.currentStock;
  inventory.reservedStock += qty;
  await inventory.save({ session });

  const updatedInventory = await recalculateInventory(productId, session);

  await recordMovement(
    productId,
    inventory._id,
    "Reservation",
    qty,
    previousStock,
    inventory.currentStock,
    referenceModule,
    referenceId,
    referenceNumber,
    remarks,
    movementReason || "Order Confirmed",
    createdBy,
    session
  );

  return updatedInventory;
};

/**
 * Releases reserved stock back to available stock.
 */
const releaseReservedStock = async (
  productId,
  quantity,
  referenceModule,
  referenceId = null,
  referenceNumber = "",
  remarks = "",
  movementReason = "",
  createdBy = null,
  session = null
) => {
  const inventory = await Inventory.findOne({ productId }).session(session);
  if (!inventory) {
    const error = new Error("Inventory record not found.");
    error.statusCode = 404;
    throw error;
  }

  const qty = Number(quantity);
  if (inventory.reservedStock < qty) {
    const error = new Error("Insufficient reserved stock to release.");
    error.statusCode = 400;
    throw error;
  }

  const previousStock = inventory.currentStock;
  inventory.reservedStock -= qty;
  await inventory.save({ session });

  const updatedInventory = await recalculateInventory(productId, session);

  await recordMovement(
    productId,
    inventory._id,
    "Reservation Release",
    qty,
    previousStock,
    inventory.currentStock,
    referenceModule,
    referenceId,
    referenceNumber,
    remarks,
    movementReason || "Order Cancelled",
    createdBy,
    session
  );

  return updatedInventory;
};

/**
 * Manually adjusts stock level.
 */
const adjustStock = async (
  productId,
  newStockValue,
  remarks = "",
  movementReason = "",
  createdBy = null,
  session = null
) => {
  const inventory = await Inventory.findOne({ productId }).session(session);
  if (!inventory) {
    const error = new Error("Inventory record not found.");
    error.statusCode = 404;
    throw error;
  }

  const previousStock = inventory.currentStock;
  const newStock = Number(newStockValue);

  inventory.currentStock = newStock;
  await inventory.save({ session });

  const updatedInventory = await recalculateInventory(productId, session);

  await recordMovement(
    productId,
    inventory._id,
    "Manual Adjustment",
    Math.abs(newStock - previousStock),
    previousStock,
    newStock,
    "Inventory",
    inventory._id,
    inventory.inventoryCode,
    remarks,
    movementReason || "Stock Audit",
    createdBy,
    session
  );

  return updatedInventory;
};

/**
 * Sync inventory calculations and status.
 */
const syncInventory = async (productId, session = null) => {
  return await recalculateInventory(productId, session);
};

/**
 * Validates stock availability.
 * @param {string} productId
 * @param {number} quantity
 * @returns {object} { available, reserved, current, isAvailable }
 */
const validateStockAvailability = async (productId, quantity) => {
  const inventory = await Inventory.findOne({ productId });
  if (!inventory) {
    return { available: 0, reserved: 0, current: 0, isAvailable: false };
  }

  const available = inventory.availableStock;
  return {
    available,
    reserved: inventory.reservedStock,
    current: inventory.currentStock,
    isAvailable: available >= Number(quantity),
  };
};

module.exports = {
  createInventory,
  increaseStock,
  decreaseStock,
  reserveStock,
  releaseReservedStock,
  adjustStock,
  calculateAvailableStock,
  updateStockStatus,
  recordMovement,
  syncInventory,
  recalculateInventory,
  validateStockAvailability,
};
