const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  softDeleteOrder,
  searchOrders,
} = require("../controllers/order.controller");

const {
  createOrderValidation,
} = require("../validators/order.validator");

router.post("/", createOrderValidation, createOrder);

// Search first to avoid collision with ID route
router.get("/search", searchOrders);

// Get All
router.get("/", getOrders);

// Get By Id
router.get("/:id", getOrderById);

// Update
router.put("/:id", updateOrder);

// Status update
router.patch("/:id/status", updateOrderStatus);

// Soft Delete (Archive)
router.delete("/:id", softDeleteOrder);

module.exports = router;
