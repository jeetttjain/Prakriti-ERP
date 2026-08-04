const express = require("express");
const router = express.Router();
const {
  getLiveness,
  getReadiness,
  getDatabaseHealth,
  getCacheHealth,
  getStorageHealth,
  getSystemHealth,
  getVersionHealth,
} = require("../controllers/health.controller");

const { authenticate } = require("../middlewares/auth.middleware");

// ── Public Probes (No Auth Required) ──────────────
router.get("/", getLiveness);
router.get("/ready", getReadiness);

// ── Private Health Endpoints (Admin RBAC Only) ─────
router.get("/database", authenticate, getDatabaseHealth);
router.get("/cache", authenticate, getCacheHealth);
router.get("/storage", authenticate, getStorageHealth);
router.get("/system", authenticate, getSystemHealth);
router.get("/version", authenticate, getVersionHealth);

module.exports = router;
