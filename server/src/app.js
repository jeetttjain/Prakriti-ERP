const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const paymentRoutes = require("./routes/payment.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const supplierRoutes = require("./routes/supplier.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const settingsRoutes = require("./routes/settings.routes");
const reportRoutes = require("./routes/report.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const roleRoutes = require("./routes/role.routes");
const notificationRoutes = require("./routes/notification.routes");
const customerPortalRoutes = require("./routes/customerPortal.routes");
const exportRoutes = require("./routes/export.routes");
const auditRoutes = require("./routes/auditLog.routes");
const automationRoutes = require("./routes/automation.routes");
const businessIntelligenceRoutes = require("./routes/businessIntelligence.routes");
const communicationRoutes = require("./routes/communication.routes");
const enterpriseDataRoutes = require("./routes/enterpriseData.routes");
const identityRoutes = require("./routes/identity.routes");
const observabilityRoutes = require("./routes/observability.routes");
const financeRoutes = require("./routes/finance.routes");
const supplyChainRoutes = require("./routes/supplychain.routes");
const systemControlRoutes = require("./routes/systemControl.routes");
const hrmsRoutes = require("./routes/hrms.routes");
const crmRoutes = require("./routes/crm.routes");
const healthRoutes = require("./routes/health.routes");
const schedulerService = require("./services/scheduler.service");
const initAllListeners = require("./core/listeners");

const app = express();

// Trust reverse proxy for Railway/Vercel/Cloudflare
app.set("trust proxy", 1);

// Initialize background scheduler and Event Bus listeners on server start
schedulerService.startScheduler();
initAllListeners();

// Production Security Response Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Request-Id", `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  next();
});

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// Health & Readiness Probes
app.use("/health", healthRoutes);
app.use("/ready", healthRoutes);

// Business API Routes
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/customer-portal", customerPortalRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/bi", businessIntelligenceRoutes);
app.use("/api/communication", communicationRoutes);
app.use("/api/data", enterpriseDataRoutes);
app.use("/api/identity", identityRoutes);
app.use("/api/observability", observabilityRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/supplychain", supplyChainRoutes);
app.use("/api/system", systemControlRoutes);
app.use("/api/hrms", hrmsRoutes);
app.use("/api/crm", crmRoutes);

// Root Index Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    project: "Prakriti ERP & Customer Portal Platform",
    message: "Backend is running successfully 🚀",
  });
});

// 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found on server.`,
  });
});

// Global Production Error Middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler Caught Exception:", err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected internal server error occurred.";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
});

module.exports = app;