const express = require("express");
const router = express.Router();
const { getSettings, updateSettings, toggleModule } = require("../controllers/settings.controller");

// Retrieve global configuration
router.get("/", getSettings);

// Update configuration values
router.put("/", updateSettings);

// Toggle modules / flags
router.post("/toggle", toggleModule);

module.exports = router;
