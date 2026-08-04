const Purchase = require("../models/Purchase");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const inventoryService = require("./inventory.service");

/**
 * Calculates financial totals of a purchase transaction.
 */
const calculatePurchaseTotals = (itemsSubtotal, discount = 0, transport = 0) => {
  const subtotal = Number(itemsSubtotal) || 0;
  const disc = Number(discount) || 0;
  const trans = Number(transport) || 0;

  const grandTotal = Math.max(0, subtotal - disc + trans);

  return {
    subtotal,
    discount: disc,
    transport: trans,
    grandTotal,
  };
};

/**
 * Validates details, snapshots supplier, and creates a Purchase Order.
 */
const createPurchase = async (purchaseData, session = null) => {
  const {
    supplierId,
    expectedDelivery,
    purchaseStatus = "Draft",
    purchaseType = "Regular",
    purchaseItems,
    discount = 0,
    transport = 0,
    notes = "",
    createdBy = null,
  } = purchaseData;

  // 1. Fetch Supplier details and build snapshot
  const supplier = await Supplier.findById(supplierId).session(session);
  if (!supplier) {
    const error = new Error(`Supplier with ID ${supplierId} not found.`);
    error.statusCode = 404;
    throw error;
  }

  const supplierSnapshot = {
    businessName: supplier.businessName,
    personName: supplier.personName,
    mobile: supplier.mobile,
    gst: supplier.gst || "",
    address: supplier.address || "",
    paymentTerms: supplier.paymentTerms || "",
  };

  // 2. Validate and snapshot products
  const finalPurchaseItems = [];
  let computedSubtotal = 0;

  for (const item of purchaseItems) {
    const product = await Product.findById(item.productId).session(session);
    if (!product) {
      const error = new Error(`Product with ID ${item.productId} not found in catalog.`);
      error.statusCode = 404;
      throw error;
    }

    const qty = Number(item.quantity);
    const price = Number(item.purchasePrice);
    const amount = qty * price;
    computedSubtotal += amount;

    finalPurchaseItems.push({
      productId: item.productId,
      productCode: product.productCode,
      productName: product.productName,
      quantity: qty,
      receivedQuantity: 0,
      pendingQuantity: qty,
      purchasePrice: price,
      unit: product.unit,
      amount,
    });
  }

  // 3. Compute Totals
  const totals = calculatePurchaseTotals(computedSubtotal, discount, transport);

  // 4. Handle initial approvals
  let approvedBy = null;
  let approvedAt = null;
  if (purchaseStatus === "Ordered") {
    approvedBy = createdBy || "System Auto Approval";
    approvedAt = new Date();
  }

  const purchase = new Purchase({
    supplierId,
    supplierSnapshot,
    expectedDelivery,
    purchaseStatus,
    purchaseType,
    purchaseItems: finalPurchaseItems,
    subtotal: totals.subtotal,
    discount: totals.discount,
    transport: totals.transport,
    grandTotal: totals.grandTotal,
    notes,
    approvedBy,
    approvedAt,
    createdBy,
  });

  await purchase.save({ session });
  return purchase;
};

/**
 * Mark a purchase order as Received and atomically increase stock levels.
 */
const receivePurchase = async (purchaseId, receivedBy, session = null) => {
  const purchase = await Purchase.findById(purchaseId).session(session);
  if (!purchase) {
    const error = new Error("Purchase record not found.");
    error.statusCode = 404;
    throw error;
  }

  if (purchase.purchaseStatus === "Received") {
    const error = new Error("Purchase order has already been received.");
    error.statusCode = 400;
    throw error;
  }

  if (purchase.purchaseStatus === "Cancelled") {
    const error = new Error("Cannot receive a cancelled purchase order.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Process items and increase inventory stock
  for (const item of purchase.purchaseItems) {
    item.receivedQuantity = item.quantity;
    item.pendingQuantity = 0;

    await inventoryService.increaseStock(
      item.productId,
      item.quantity,
      "Purchase",
      purchase._id,
      purchase.purchaseNumber,
      `Repenishment stock from PO ${purchase.purchaseNumber}`,
      "Supplier Return", // Reason
      receivedBy,
      session
    );
  }

  // 2. Transition status
  purchase.purchaseStatus = "Received";
  purchase.updatedBy = receivedBy;

  await purchase.save({ session });
  return purchase;
};

/**
 * Cancel a purchase order.
 */
const cancelPurchase = async (purchaseId, cancelledBy, session = null) => {
  const purchase = await Purchase.findById(purchaseId).session(session);
  if (!purchase) {
    const error = new Error("Purchase record not found.");
    error.statusCode = 404;
    throw error;
  }

  if (purchase.purchaseStatus === "Received") {
    const error = new Error("Cannot cancel a purchase order that has already been received.");
    error.statusCode = 400;
    throw error;
  }

  purchase.purchaseStatus = "Cancelled";
  purchase.updatedBy = cancelledBy;

  await purchase.save({ session });
  return purchase;
};

module.exports = {
  calculatePurchaseTotals,
  createPurchase,
  receivePurchase,
  cancelPurchase,
};
