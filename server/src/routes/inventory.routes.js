const express = require("express");
const router = express.Router();
const {
  createOpeningStock,
  getInventory,
  getInventoryById,
  adjustInventory,
  reserveInventory,
  releaseReservation,
  searchInventory,
  getMovementHistory,
} = require("../controllers/inventory.controller");
const {
  createOpeningStockValidation,
  adjustInventoryValidation,
  reserveInventoryValidation,
  releaseReservationValidation,
} = require("../validators/inventory.validator");

// Create Opening Stock
router.post("/", createOpeningStockValidation, createOpeningStock);

// Search Inventory (Put before ID route)
router.get("/search", searchInventory);

// Get Stock Movements
router.get("/movements", getMovementHistory);

// Adjust Inventory levels
router.put("/adjust", adjustInventoryValidation, adjustInventory);

// Reserve Stock
router.post("/reserve", reserveInventoryValidation, reserveInventory);

// Release Stock Reservation
router.post("/release", releaseReservationValidation, releaseReservation);

// Get Inventory by ID / Product ID
router.get("/:id", getInventoryById);

// Get All Inventory
router.get("/", getInventory);

module.exports = router;
