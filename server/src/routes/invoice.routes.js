const express = require("express");

const router = express.Router();

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  softDeleteInvoice,
  searchInvoices,
} = require("../controllers/invoice.controller");

const {
  createInvoiceValidation,
} = require("../validators/invoice.validator");

router.post("/", createInvoiceValidation, createInvoice);

// Search first to avoid collision with ID route
router.get("/search", searchInvoices);

// Get All
router.get("/", getInvoices);

// Get By Id
router.get("/:id", getInvoiceById);

// Update
router.put("/:id", updateInvoice);

// Status update
router.patch("/:id/status", updateInvoiceStatus);

// Soft Delete (Archive)
router.delete("/:id", softDeleteInvoice);

module.exports = router;
