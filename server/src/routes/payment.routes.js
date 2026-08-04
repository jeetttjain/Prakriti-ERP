const express = require("express");

const router = express.Router();

const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  updatePaymentStatus,
  softDeletePayment,
  searchPayments,
} = require("../controllers/payment.controller");

const {
  createPaymentValidation,
} = require("../validators/payment.validator");

router.post("/", createPaymentValidation, createPayment);

// Search first to avoid collision with ID route
router.get("/search", searchPayments);

// Get All
router.get("/", getPayments);

// Get By Id
router.get("/:id", getPaymentById);

// Update details
router.put("/:id", updatePayment);

// Status update
router.patch("/:id/status", updatePaymentStatus);

// Soft Delete (Archive)
router.delete("/:id", softDeletePayment);

module.exports = router;
