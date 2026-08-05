const mongoose = require("mongoose");
const os = require("os");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Purchase = require("../models/Purchase");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const UserSession = require("../models/UserSession");
const AuditLog = require("../models/AuditLog");
const User = require("../models/User");
const schedulerService = require("./scheduler.service");
const { queueAdapter } = require("./queue.service");
const { buildGlobalFilter, calculateKPIs } = require("./kpi.service");

// Simple In-Memory Analytics Cache Layer
let analyticsCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 Seconds default TTL

/**
 * Generates cache key based on query filters and endpoint.
 */
const getCacheKey = (endpoint, query) => {
  return `${endpoint}:${JSON.stringify(query)}`;
};

/**
 * Retrieves cached response or null if expired.
 */
const getFromCache = (key) => {
  const cached = analyticsCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    analyticsCache.delete(key);
    return null;
  }
  return cached.data;
};

/**
 * Stores data in cache.
 */
const setCache = (key, data) => {
  analyticsCache.set(key, { timestamp: Date.now(), data });
};

/**
 * Clears all cached analytics.
 */
const clearAnalyticsCache = () => {
  analyticsCache.clear();
  return { message: "Analytics cache cleared successfully." };
};

/**
 * GET OVERVIEW DATA (MongoDB Aggregation Pipeline)
 */
const getOverviewData = async (query = {}) => {
  const cacheKey = getCacheKey("overview", query);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const filter = buildGlobalFilter(query);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    invoiceSummary,
    orderSummary,
    customerSummary,
    supplierSummary,
    productSummary,
    inventorySummary,
    paymentSummary,
    purchaseSummary,
  ] = await Promise.all([
    // Invoices Aggregation (Revenue)
    Invoice.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $facet: {
          total: [{ $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }],
          today: [
            { $match: { createdAt: { $gte: todayStart } } },
            { $group: { _id: null, todayRevenue: { $sum: "$totalAmount" } } },
          ],
          monthly: [
            { $match: { createdAt: { $gte: monthStart } } },
            { $group: { _id: null, monthlyRevenue: { $sum: "$totalAmount" } } },
          ],
          pendingDues: [
            { $match: { status: { $in: ["Unpaid", "Partial"] } } },
            { $group: { _id: null, totalPending: { $sum: "$dueAmount" } } },
          ],
        },
      },
    ]),

    // Orders Aggregation
    Order.aggregate([
      { $match: filter },
      {
        $facet: {
          total: [{ $count: "count" }],
          today: [{ $match: { createdAt: { $gte: todayStart } } }, { $count: "count" }],
          pending: [{ $match: { orderStatus: { $in: ["Pending", "Confirmed", "Processing"] } } }, { $count: "count" }],
          completed: [{ $match: { orderStatus: "Delivered" } }, { $count: "count" }],
          cancelled: [{ $match: { orderStatus: "Cancelled" } }, { $count: "count" }],
        },
      },
    ]),

    // Customers Aggregation
    Customer.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [{ $match: { status: "Active" } }, { $count: "count" }],
          newCount: [{ $match: { createdAt: { $gte: thirtyDaysAgo } } }, { $count: "count" }],
        },
      },
    ]),

    // Suppliers Aggregation
    Supplier.aggregate([{ $count: "count" }]),

    // Products Aggregation
    Product.aggregate([{ $count: "count" }]),

    // Inventory Valuation & Stock Alerts Aggregation
    Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $facet: {
          valuation: [
            {
              $group: {
                _id: null,
                totalValue: { $sum: { $multiply: ["$currentStock", "$product.price"] } },
              },
            },
          ],
          lowStock: [
            {
              $match: {
                $expr: { $lte: ["$currentStock", { $ifNull: ["$reorderLevel", 10] }] },
              },
            },
            { $count: "count" },
          ],
          outOfStock: [
            { $match: { currentStock: { $lte: 0 } } },
            { $count: "count" },
          ],
        },
      },
    ]),

    // Payments Cleared Aggregation
    Payment.aggregate([
      { $match: { paymentStatus: "Completed" } },
      { $group: { _id: null, totalReceived: { $sum: "$amount" } } },
    ]),

    // Purchase Expenses Aggregation
    Purchase.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalExpenses: { $sum: "$totalAmount" } } },
    ]),
  ]);

  const totalRevenue = invoiceSummary[0]?.total[0]?.totalRevenue || 0;
  const todayRevenue = invoiceSummary[0]?.today[0]?.todayRevenue || 0;
  const monthlyRevenue = invoiceSummary[0]?.monthly[0]?.monthlyRevenue || 0;
  const pendingPayments = invoiceSummary[0]?.pendingDues[0]?.totalPending || 0;

  const totalOrders = orderSummary[0]?.total[0]?.count || 0;
  const todayOrders = orderSummary[0]?.today[0]?.count || 0;
  const pendingOrders = orderSummary[0]?.pending[0]?.count || 0;
  const completedOrders = orderSummary[0]?.completed[0]?.count || 0;
  const cancelledOrders = orderSummary[0]?.cancelled[0]?.count || 0;

  const totalCustomers = customerSummary[0]?.total[0]?.count || 0;
  const activeCustomers = customerSummary[0]?.active[0]?.count || 0;
  const newCustomers = customerSummary[0]?.newCount[0]?.count || 0;

  const totalSuppliers = supplierSummary[0]?.count || 0;
  const totalProducts = productSummary[0]?.count || 0;

  const inventoryValue = inventorySummary[0]?.valuation[0]?.totalValue || 0;
  const lowStockItems = inventorySummary[0]?.lowStock[0]?.count || 0;
  const outOfStockItems = inventorySummary[0]?.outOfStock[0]?.count || 0;

  const receivedPayments = paymentSummary[0]?.totalReceived || 0;
  const expenses = purchaseSummary[0]?.totalExpenses || 0;

  const profit = totalRevenue - expenses;
  const cashFlow = receivedPayments - expenses;
  const netMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : "0.00";

  // Reusable KPI engine calculations
  const kpiData = await calculateKPIs(query);

  const result = {
    revenue: totalRevenue,
    todayRevenue,
    monthlyRevenue,
    orders: totalOrders,
    todayOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalCustomers,
    activeCustomers,
    newCustomers,
    totalSuppliers,
    totalProducts,
    lowStockItems,
    outOfStockItems,
    inventoryValue,
    pendingPayments,
    receivedPayments,
    profit,
    expenses,
    cashFlow,
    netMargin: Number(netMargin),
    growthPercentage: kpiData.momRevenueGrowthPct,
    kpis: kpiData,
  };

  setCache(cacheKey, result);
  return result;
};

/**
 * GET CHARTS DATA (Pre-aggregated optimized datasets)
 */
const getChartsData = async (query = {}) => {
  const cacheKey = getCacheKey("charts", query);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const [
    monthlySales,
    categoryDist,
    topProducts,
    topCustomers,
    topSuppliers,
    paymentTrend,
    purchaseTrend,
  ] = await Promise.all([
    // Monthly Sales Trend
    Invoice.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),

    // Category Distribution
    Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          totalSales: { $sum: "$items.totalPrice" },
          quantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSales: -1 } },
    ]),

    // Top Selling Products
    Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]),

    // Top Customers by Revenue
    Invoice.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: "$customerSnapshot.businessName",
          totalSpent: { $sum: "$totalAmount" },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]),

    // Top Suppliers by Purchase Volume
    Purchase.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: "$supplierSnapshot.businessName",
          totalPurchased: { $sum: "$totalAmount" },
          purchaseCount: { $sum: 1 },
        },
      },
      { $sort: { totalPurchased: -1 } },
      { $limit: 5 },
    ]),

    // Payment Collections Trend
    Payment.aggregate([
      { $match: { paymentStatus: "Completed" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$paymentDate" } },
          totalCollected: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),

    // Purchase Expenses Trend
    Purchase.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalPurchases: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
  ]);

  const result = {
    dailySales: [], // Prepared for future hourly granularity
    monthlySales: monthlySales.map((item) => ({ label: item._id, revenue: item.totalRevenue, count: item.orderCount })),
    categoryDistribution: categoryDist.map((item) => ({ category: item._id || "General", value: item.totalSales })),
    topSellingProducts: topProducts.map((item) => ({ productName: item._id, quantity: item.totalQuantity, revenue: item.totalRevenue })),
    topCustomers: topCustomers.map((item) => ({ customerName: item._id || "Unknown", amount: item.totalSpent })),
    topSuppliers: topSuppliers.map((item) => ({ supplierName: item._id || "Unknown", amount: item.totalPurchased })),
    paymentTrend: paymentTrend.map((item) => ({ label: item._id, amount: item.totalCollected })),
    purchaseTrend: purchaseTrend.map((item) => ({ label: item._id, amount: item.totalPurchases })),
  };

  setCache(cacheKey, result);
  return result;
};

/**
 * GET ACTIVITY DATA (Recent timeline events)
 */
const getActivityData = async () => {
  const cacheKey = getCacheKey("activity", {});
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const [
    latestOrders,
    latestPayments,
    latestPurchases,
    recentCustomers,
    recentSuppliers,
    latestAuditEvents,
    latestLogins,
  ] = await Promise.all([
    Order.find({}).sort({ createdAt: -1 }).limit(5).select("orderNumber customerSnapshot grandTotal orderStatus createdAt"),
    Payment.find({}).sort({ createdAt: -1 }).limit(5).select("transactionId amount paymentMethod paymentStatus paymentDate"),
    Purchase.find({}).sort({ createdAt: -1 }).limit(5).select("purchaseNumber supplierSnapshot totalAmount status createdAt"),
    Customer.find({}).sort({ createdAt: -1 }).limit(5).select("businessName personName mobile status createdAt"),
    Supplier.find({}).sort({ createdAt: -1 }).limit(5).select("businessName contactPerson mobile status createdAt"),
    AuditLog.find({}).sort({ timestamp: -1 }).limit(5).select("action module performedBy timestamp ipAddress"),
    UserSession.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).populate("userId", "name userCode email"),
  ]);

  const result = {
    latestOrders,
    latestPayments,
    latestPurchases,
    recentCustomers,
    recentSuppliers,
    latestAuditEvents,
    latestLogins,
  };

  setCache(cacheKey, result);
  return result;
};

/**
 * GET ALERTS DATA (Exceptions & System warnings)
 */
const getAlertsData = async () => {
  const cacheKey = getCacheKey("alerts", {});
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const [lowStock, overduePayments, inactiveCustomers, outOfStock] = await Promise.all([
    Inventory.find({ $expr: { $lte: ["$currentStock", { $ifNull: ["$reorderLevel", 10] }] } })
      .populate("productId", "productName category unit price")
      .limit(5),

    Invoice.find({ status: { $in: ["Unpaid", "Partial"] }, dueDate: { $lt: new Date() } })
      .select("invoiceNumber customerSnapshot dueAmount dueDate status")
      .limit(5),

    Customer.find({ status: "Inactive" })
      .select("businessName personName mobile status updatedAt")
      .limit(5),

    Inventory.find({ currentStock: { $lte: 0 } })
      .populate("productId", "productName category unit")
      .limit(5),
  ]);

  const result = {
    lowStock,
    outOfStock,
    overduePayments,
    inactiveCustomers,
    systemWarnings: [],
    automationFailures: [],
  };

  setCache(cacheKey, result);
  return result;
};

/**
 * GET HEALTH DATA (System Probes & Metrics)
 */
const getHealthData = async () => {
  const dbState = mongoose.connection.readyState;
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  const pingStart = Date.now();
  let dbPingMs = 0;

  try {
    await mongoose.connection.db.admin().ping();
    dbPingMs = Date.now() - pingStart;
  } catch {}

  const memory = process.memoryUsage();
  const schedulerStatus = schedulerService.getStatus();
  const queueHealth = queueAdapter.getHealth();

  return {
    database: {
      status: states[dbState] || "Unknown",
      dbName: mongoose.connection.name,
      latencyMs: dbPingMs,
    },
    api: {
      status: "UP",
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
    },
    scheduler: {
      active: !schedulerStatus.isPaused,
      activeJobs: schedulerStatus.activeJobsCount || 0,
    },
    automation: {
      status: "HEALTHY",
      workers: queueHealth.runningJobs || 0,
      pendingJobs: queueHealth.pendingJobs || 0,
    },
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
      freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
      processRssMB: Math.round(memory.rss / 1024 / 1024),
      cpuCores: os.cpus().length,
    },
  };
};

/**
 * USER PREFERENCES MANAGEMENT (Database Backed)
 */
const getUserPreferences = async (userId) => {
  const user = await User.findById(userId).select("dashboardPreferences");
  return user ? user.dashboardPreferences || {} : {};
};

const updateUserPreferences = async (userId, preferences) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User account not found.");
  user.dashboardPreferences = { ...user.dashboardPreferences, ...preferences };
  await user.save();
  return user.dashboardPreferences;
};

module.exports = {
  getOverviewData,
  getChartsData,
  getActivityData,
  getAlertsData,
  getHealthData,
  getUserPreferences,
  updateUserPreferences,
  clearAnalyticsCache,
};
