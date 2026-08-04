const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/customerPortal.controller");
const { authenticateCustomer } = require("../middlewares/customerPortal.middleware");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// ── Public Auth & QR ────────────────────────────
router.post("/auth/login", ctrl.login);
router.post("/auth/refresh", ctrl.refresh);
router.post("/auth/send-otp", ctrl.sendOTP);
router.post("/auth/verify-otp", ctrl.verifyOTP);
router.post("/qr/scan", ctrl.scanQR);

// ── Admin: enable portal access for a customer ──
router.post(
  "/auth/enable-portal",
  authenticate,
  authorize("Customer", "edit"),
  ctrl.enablePortal
);

// ── Protected Customer Routes ────────────────────
router.get("/dashboard", authenticateCustomer, ctrl.getDashboard);

router.get("/orders", authenticateCustomer, ctrl.getOrders);
router.get("/orders/:id", authenticateCustomer, ctrl.getOrderDetails);

router.get("/invoices", authenticateCustomer, ctrl.getInvoices);
router.get("/invoices/:id", authenticateCustomer, ctrl.getInvoiceDetails);

router.get("/payments", authenticateCustomer, ctrl.getPayments);
router.get("/outstanding", authenticateCustomer, ctrl.getOutstanding);

router.get("/profile", authenticateCustomer, ctrl.getProfile);

router.get("/notifications", authenticateCustomer, ctrl.getNotifications);
router.put("/notifications/:id/read", authenticateCustomer, ctrl.markNotificationRead);

// ── Phase-2: Product Catalog ─────────────────────
router.get("/products", authenticateCustomer, ctrl.getPortalProducts);
router.get("/products/:id", authenticateCustomer, ctrl.getPortalProductById);
router.get("/categories", authenticateCustomer, ctrl.getCategories);

// ── Phase-2: Offers ──────────────────────────────
router.get("/offers", authenticateCustomer, ctrl.getOffers);

// ── Phase-2: Order Placement ─────────────────────
router.get("/drafts", authenticateCustomer, ctrl.getDraftOrders);
router.post("/orders", authenticateCustomer, ctrl.placeOrder);
router.put("/orders/:id", authenticateCustomer, ctrl.updateDraftOrder);
router.delete("/orders/:id", authenticateCustomer, ctrl.deleteDraftOrder);
router.post("/orders/:id/reorder", authenticateCustomer, ctrl.reorder);

// ── Phase-2: Favorites ───────────────────────────
router.get("/favorites", authenticateCustomer, ctrl.getFavorites);
router.post("/favorites", authenticateCustomer, ctrl.addFavorite);
router.delete("/favorites/:productId", authenticateCustomer, ctrl.removeFavorite);

// ── Phase-2: Support Tickets ─────────────────────
router.get("/support", authenticateCustomer, ctrl.getSupportTickets);
router.post("/support", authenticateCustomer, ctrl.submitSupportTicket);

module.exports = router;
