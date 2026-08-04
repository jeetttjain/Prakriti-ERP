const Purchase = require("../models/Purchase");
const Supplier = require("../models/Supplier");
const { validationResult } = require("express-validator");
const { successResponse, errorResponse, paginatedResponse } = require("../services/response.service");
const { getPagination } = require("../services/pagination.service");
const { executeTransaction } = require("../services/transaction.service");
const purchaseService = require("../services/purchase.service");
const { invalidateReportCaches } = require("../services/cache.service");

// CREATE PURCHASE
exports.createPurchase = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const purchase = await executeTransaction(async (session) => {
      return await purchaseService.createPurchase(req.body, session);
    });

    invalidateReportCaches();
    return successResponse(res, purchase, "Purchase Order registered successfully.", 201);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET PURCHASES (PAGINATED & FILTERED)
exports.getPurchases = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query, { purchaseDate: -1 });

    const filter = {};
    if (req.query.status) {
      filter.purchaseStatus = req.query.status;
    }
    if (req.query.type) {
      filter.purchaseType = req.query.type;
    }
    if (req.query.supplier) {
      filter.supplierId = req.query.supplier;
    }

    const purchases = await Purchase.find(filter)
      .populate("supplierId", "businessName personName mobile supplierCode")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Purchase.countDocuments(filter);

    return paginatedResponse(res, purchases, page, limit, total, "totalPurchases");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET PURCHASE BY ID
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplierId", "businessName personName mobile supplierCode");

    if (!purchase) {
      return errorResponse(res, "Purchase record not found.", 404);
    }
    return successResponse(res, purchase);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE PURCHASE
exports.updatePurchase = async (req, res) => {
  try {
    const result = await executeTransaction(async (session) => {
      const purchase = await Purchase.findById(req.params.id).session(session);
      if (!purchase) {
        const error = new Error("Purchase record not found.");
        error.statusCode = 404;
        throw error;
      }

      if (purchase.purchaseStatus === "Received" || purchase.purchaseStatus === "Cancelled") {
        const error = new Error("Cannot modify a Received or Cancelled purchase order.");
        error.statusCode = 400;
        throw error;
      }

      // Check for Draft -> Ordered transition
      if (req.body.purchaseStatus === "Ordered" && purchase.purchaseStatus === "Draft") {
        purchase.approvedBy = req.body.approvedBy || "System Auto Approval";
        purchase.approvedAt = new Date();
      }

      // Block metadata changes
      delete req.body.purchaseNumber;
      delete req.body.supplierId;
      delete req.body.supplierSnapshot;

      Object.assign(purchase, req.body);
      
      // Re-calculate totals if items change
      if (req.body.purchaseItems) {
        let computedSubtotal = 0;
        for (const item of purchase.purchaseItems) {
          item.amount = item.quantity * item.purchasePrice;
          item.pendingQuantity = item.quantity - item.receivedQuantity;
          computedSubtotal += item.amount;
        }
        const totals = purchaseService.calculatePurchaseTotals(computedSubtotal, purchase.discount, purchase.transport);
        purchase.subtotal = totals.subtotal;
        purchase.grandTotal = totals.grandTotal;
      } else {
        const computedSubtotal = purchase.purchaseItems.reduce((sum, item) => sum + item.amount, 0);
        const totals = purchaseService.calculatePurchaseTotals(computedSubtotal, purchase.discount, purchase.transport);
        purchase.subtotal = totals.subtotal;
        purchase.grandTotal = totals.grandTotal;
      }

      await purchase.save({ session });
      return purchase;
    });

    invalidateReportCaches();
    return successResponse(res, result, "Purchase Order updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE STATUS / TRANSITION
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { status, updatedBy } = req.body;

    const result = await executeTransaction(async (session) => {
      const purchase = await Purchase.findById(req.params.id).session(session);
      if (!purchase) {
        const error = new Error("Purchase record not found.");
        error.statusCode = 404;
        throw error;
      }

      if (status === purchase.purchaseStatus) {
        return purchase;
      }

      if (status === "Received") {
        return await purchaseService.receivePurchase(purchase._id, updatedBy || "System", session);
      }

      if (status === "Cancelled") {
        return await purchaseService.cancelPurchase(purchase._id, updatedBy || "System", session);
      }

      if (status === "Ordered" && purchase.purchaseStatus === "Draft") {
        purchase.approvedBy = updatedBy || "System Auto Approval";
        purchase.approvedAt = new Date();
      }

      purchase.purchaseStatus = status;
      purchase.updatedBy = updatedBy;

      await purchase.save({ session });
      return purchase;
    });

    invalidateReportCaches();
    return successResponse(res, result, "Purchase status updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// RECEIVE PURCHASE (EXPLICIT DIRECT ENDPOINT)
exports.receivePurchase = async (req, res) => {
  try {
    const { receivedBy } = req.body;
    const purchase = await executeTransaction(async (session) => {
      return await purchaseService.receivePurchase(req.params.id, receivedBy || "System", session);
    });

    invalidateReportCaches();
    return successResponse(res, purchase, "Purchase items received and inventory updated.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// CANCEL PURCHASE (EXPLICIT DIRECT ENDPOINT)
exports.cancelPurchase = async (req, res) => {
  try {
    const { cancelledBy } = req.body;
    const purchase = await executeTransaction(async (session) => {
      return await purchaseService.cancelPurchase(req.params.id, cancelledBy || "System", session);
    });

    invalidateReportCaches();
    return successResponse(res, purchase, "Purchase order cancelled successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SEARCH PURCHASES
exports.searchPurchases = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    const matchingSuppliers = await Supplier.find({
      $or: [
        { businessName: { $regex: keyword, $options: "i" } },
        { personName: { $regex: keyword, $options: "i" } },
      ],
    }).select("_id");

    const supplierIds = matchingSuppliers.map((s) => s._id);

    const filter = {
      $or: [
        { purchaseNumber: { $regex: keyword, $options: "i" } },
        { supplierId: { $in: supplierIds } },
        { "supplierSnapshot.businessName": { $regex: keyword, $options: "i" } },
        { "supplierSnapshot.personName": { $regex: keyword, $options: "i" } },
      ],
    };

    const purchases = await Purchase.find(filter)
      .populate("supplierId", "businessName personName mobile supplierCode")
      .sort({ purchaseDate: -1 });

    return successResponse(res, purchases);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
