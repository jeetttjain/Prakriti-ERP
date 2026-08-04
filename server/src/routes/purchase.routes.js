const express = require("express");
const router = express.Router();
const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  updatePurchaseStatus,
  receivePurchase,
  cancelPurchase,
  searchPurchases,
} = require("../controllers/purchase.controller");
const { purchaseValidation } = require("../validators/purchase.validator");

// Create Purchase Order
router.post("/", purchaseValidation, createPurchase);

// Search Purchase Orders
router.get("/search", searchPurchases);

// Update Status Transition
router.patch("/:id/status", updatePurchaseStatus);

// Explicit Receive Goods replenishment
router.post("/:id/receive", receivePurchase);

// Explicit Cancel Order
router.post("/:id/cancel", cancelPurchase);

// Get Purchase Order by ID
router.get("/:id", getPurchaseById);

// Update Purchase details
router.put("/:id", purchaseValidation, updatePurchase);

// Get All Purchase Orders
router.get("/", getPurchases);

module.exports = router;
