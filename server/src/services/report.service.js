const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Purchase = require("../models/Purchase");
const cache = require("./cache.service");

/**
 * Standardized report wrapper injecting performance audit meta metrics.
 */
const wrapReport = async (reportName, filters, generatorFn, user = "System") => {
  const startTime = Date.now();
  const data = await generatorFn();
  const executionTime = Date.now() - startTime;

  return {
    summary: data.summary || {},
    cards: data.cards || {},
    charts: data.charts || {},
    tables: data.tables || {},
    filters: filters || {},
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: user,
      reportName,
      appliedFilters: filters || {},
      executionTime,
    },
  };
};

/**
 * Date range parser mapping keywords to absolute dates.
 */
const parseDateRange = (rangeType, startDate, endDate) => {
  const now = new Date();
  let start = new Date(0); // Epoch start
  let end = new Date();

  if (rangeType === "Today") {
    start = new Date(now.setHours(0, 0, 0, 0));
    end = new Date(now.setHours(23, 59, 59, 999));
  } else if (rangeType === "Yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    start = new Date(yesterday.setHours(0, 0, 0, 0));
    end = new Date(yesterday.setHours(23, 59, 59, 999));
  } else if (rangeType === "Week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    start = new Date(weekAgo.setHours(0, 0, 0, 0));
  } else if (rangeType === "Month") {
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);
    start = new Date(monthAgo.setHours(0, 0, 0, 0));
  } else if (rangeType === "Year") {
    const yearAgo = new Date(now);
    yearAgo.setDate(now.getDate() - 365);
    start = new Date(yearAgo.setHours(0, 0, 0, 0));
  } else if (rangeType === "Custom" && startDate) {
    start = new Date(startDate);
    if (endDate) {
      end = new Date(endDate);
    }
  }

  return { start, end };
};

/**
 * Consolidate counts and sum metrics for key KPIs.
 */
const getDashboardSummary = async (filters = {}, user = "System") => {
  const cacheKey = "dashboard_summary_report";
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const result = await wrapReport("Dashboard Summary", filters, async () => {
    const totalCustomers = await Customer.countDocuments({});
    const activeCustomers = await Customer.countDocuments({ status: "Active" });
    const totalSuppliers = await Supplier.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalInventoryItems = await Inventory.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ["Pending", "Confirmed", "Processing"] } });
    const deliveredOrders = await Order.countDocuments({ orderStatus: "Delivered" });
    const totalPurchases = await Purchase.countDocuments({});

    const outstandingInvoicesResult = await Invoice.aggregate([
      { $match: { paymentStatus: { $in: ["Pending", "Partial"] }, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: "$paymentSummary.outstandingAmount" } } },
    ]);
    const outstandingInvoices = outstandingInvoicesResult[0]?.total || 0;

    const revenueResult = await Invoice.aggregate([
      { $match: { paymentStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const paymentsResult = await Payment.aggregate([
      { $match: { paymentStatus: "Completed", isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: "$amountReceived" } } },
    ]);
    const totalPaymentsReceived = paymentsResult[0]?.total || 0;

    const inventoryValResult = await Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      {
        $project: {
          itemValue: { $multiply: ["$currentStock", "$prod.purchasePrice"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$itemValue" } } },
    ]);
    const currentInventoryValue = inventoryValResult[0]?.total || 0;

    return {
      summary: {
        totalCustomers,
        activeCustomers,
        totalSuppliers,
        totalProducts,
        totalInventoryItems,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalPurchases,
        outstandingInvoices,
        totalRevenue,
        totalPaymentsReceived,
        currentInventoryValue,
      },
      cards: {
        customers: { total: totalCustomers, active: activeCustomers },
        suppliers: { total: totalSuppliers },
        inventory: { items: totalInventoryItems, value: currentInventoryValue },
        billing: { revenue: totalRevenue, collections: totalPaymentsReceived, outstanding: outstandingInvoices },
      },
    };
  }, user);

  cache.set(cacheKey, result, 60);
  return result;
};

/**
 * Sales volumes, values, averages, and trend lines.
 */
const getSalesReport = async (filters = {}, user = "System") => {
  return await wrapReport("Sales Analytics Report", filters, async () => {
    const { start, end } = parseDateRange(filters.rangeType, filters.startDate, filters.endDate);

    const match = {
      orderDate: { $gte: start, $lte: end },
    };

    if (filters.customerId) {
      match.customerId = new mongoose.Types.ObjectId(filters.customerId);
    }
    if (filters.orderStatus) {
      match.orderStatus = filters.orderStatus;
    }

    const orderStats = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$grandTotal" },
          count: { $sum: 1 },
          avgValue: { $avg: "$grandTotal" },
        },
      },
    ]);

    const salesTotal = orderStats[0]?.totalSales || 0;
    const orderCount = orderStats[0]?.count || 0;
    const averageOrderValue = orderStats[0]?.avgValue || 0;

    const dailyTrend = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          totalSales: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyTrend = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$orderDate" } },
          totalSales: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      summary: { salesTotal, orderCount, averageOrderValue },
      cards: { salesTotal, orderCount, averageOrderValue },
      charts: { dailyTrend, monthlyTrend },
      tables: { ordersList: await Order.find(match).limit(20).sort({ orderDate: -1 }) },
    };
  }, user);
};

/**
 * Purchases replenish summaries.
 */
const getPurchaseReport = async (filters = {}, user = "System") => {
  return await wrapReport("Purchase Analytics Report", filters, async () => {
    const { start, end } = parseDateRange(filters.rangeType, filters.startDate, filters.endDate);

    const match = {
      purchaseDate: { $gte: start, $lte: end },
    };

    if (filters.supplierId) {
      match.supplierId = new mongoose.Types.ObjectId(filters.supplierId);
    }
    if (filters.purchaseStatus) {
      match.purchaseStatus = filters.purchaseStatus;
    }

    const purchaseStats = await Purchase.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]);

    const purchaseTotal = purchaseStats[0]?.totalPurchases || 0;

    const purchaseTrend = await Purchase.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } },
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const supplierWise = await Purchase.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$supplierSnapshot.businessName",
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const productWise = await Purchase.aggregate([
      { $match: match },
      { $unwind: "$purchaseItems" },
      {
        $group: {
          _id: "$purchaseItems.productName",
          quantity: { $sum: "$purchaseItems.quantity" },
          total: { $sum: "$purchaseItems.amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return {
      summary: { purchaseTotal, orderCount: purchaseStats[0]?.count || 0 },
      cards: { purchaseTotal },
      charts: { purchaseTrend, supplierWise },
      tables: { productWise },
    };
  }, user);
};

/**
 * Low stock, out of stock, valuation, and moving speed.
 */
const getInventoryReport = async (filters = {}, user = "System") => {
  return await wrapReport("Inventory Stock Report", filters, async () => {
    const lowStockMatch = {
      $expr: {
        $and: [
          { $gt: ["$currentStock", 0] },
          { $lte: ["$currentStock", "$minimumStock"] },
        ],
      },
    };

    const outOfStockMatch = { currentStock: 0 };

    const lowStock = await Inventory.find(lowStockMatch).populate("productId").limit(20);
    const outOfStock = await Inventory.find(outOfStockMatch).populate("productId").limit(20);

    const valResult = await Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      {
        $project: {
          itemValue: { $multiply: ["$currentStock", "$prod.purchasePrice"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$itemValue" } } },
    ]);
    const inventoryValue = valResult[0]?.total || 0;

    const fastMoving = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productName",
          salesQuantity: { $sum: "$orderItems.quantity" },
          salesRevenue: { $sum: "$orderItems.amount" },
        },
      },
      { $sort: { salesQuantity: -1 } },
      { $limit: 10 },
    ]);

    const slowMoving = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productName",
          salesQuantity: { $sum: "$orderItems.quantity" },
          salesRevenue: { $sum: "$orderItems.amount" },
        },
      },
      { $sort: { salesQuantity: 1 } },
      { $limit: 10 },
    ]);

    return {
      summary: { inventoryValue, lowStockCount: lowStock.length, outOfStockCount: outOfStock.length },
      cards: { inventoryValue, lowStockCount: lowStock.length, outOfStockCount: outOfStock.length },
      tables: { lowStock, outOfStock, fastMoving, slowMoving },
    };
  }, user);
};

/**
 * Top buying clients, outstanding invoice dues, and sales frequencies.
 */
const getCustomerReport = async (filters = {}, user = "System") => {
  return await wrapReport("Customer Analytics Report", filters, async () => {
    const topCustomers = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      {
        $group: {
          _id: "$customerSnapshot.businessName",
          totalSpent: { $sum: "$grandTotal" },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 15 },
    ]);

    const outstanding = await Invoice.aggregate([
      { $match: { paymentStatus: { $in: ["Unpaid", "Partially Paid"] } } },
      {
        $group: {
          _id: "$customerSnapshot.businessName",
          due: { $sum: "$dueAmount" },
          invoicesCount: { $sum: 1 },
        },
      },
      { $sort: { due: -1 } },
    ]);

    return {
      summary: { totalCustomers: await Customer.countDocuments({}) },
      cards: { totalOutstanding: outstanding.reduce((sum, item) => sum + item.due, 0) },
      charts: { topCustomers },
      tables: { outstanding },
    };
  }, user);
};

/**
 * Top supplying vendors, ratings, categories, and PO values.
 */
const getSupplierReport = async (filters = {}, user = "System") => {
  return await wrapReport("Supplier Analytics Report", filters, async () => {
    const topSuppliers = await Purchase.aggregate([
      { $match: { purchaseStatus: "Received" } },
      {
        $group: {
          _id: "$supplierSnapshot.businessName",
          totalPurchase: { $sum: "$grandTotal" },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { totalPurchase: -1 } },
      { $limit: 15 },
    ]);

    const categories = await Supplier.aggregate([
      {
        $group: {
          _id: "$supplierCategory",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      summary: { totalSuppliers: await Supplier.countDocuments({}) },
      charts: { topSuppliers, categories },
      tables: { suppliersList: await Supplier.find({}).sort({ supplierRating: -1 }) },
    };
  }, user);
};

/**
 * Settle collections, clearing methods, and daily velocities.
 */
const getPaymentReport = async (filters = {}, user = "System") => {
  return await wrapReport("Payments Analytics Report", filters, async () => {
    const { start, end } = parseDateRange(filters.rangeType, filters.startDate, filters.endDate);

    const match = {
      paymentDate: { $gte: start, $lte: end },
    };

    if (filters.paymentStatus) {
      match.status = filters.paymentStatus;
    }

    const totals = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const collectionSummary = totals.find((t) => t._id === "Cleared")?.total || 0;
    const pendingPayments = totals.find((t) => t._id === "Pending")?.total || 0;

    const methodBreakdown = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const dailyCollections = await Payment.aggregate([
      { $match: { ...match, status: "Cleared" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      summary: { collectionSummary, pendingPayments },
      cards: { collectionSummary, pendingPayments },
      charts: { methodBreakdown, dailyCollections },
      tables: { paymentsList: await Payment.find(match).limit(20).sort({ paymentDate: -1 }) },
    };
  }, user);
};

/**
 * Outstanding invoice dues.
 */
const getOutstandingReport = async (filters = {}, user = "System") => {
  return await wrapReport("Outstanding Receivables Report", filters, async () => {
    const outstandingInvoices = await Invoice.find({
      paymentStatus: { $in: ["Unpaid", "Partially Paid"] },
    })
      .populate("orderId")
      .limit(30)
      .sort({ dueDate: 1 });

    const totalDueResult = await Invoice.aggregate([
      { $match: { paymentStatus: { $in: ["Unpaid", "Partially Paid"] } } },
      { $group: { _id: null, total: { $sum: "$dueAmount" } } },
    ]);
    const totalDue = totalDueResult[0]?.total || 0;

    return {
      summary: { totalDue },
      cards: { totalDue },
      tables: { outstandingInvoices },
    };
  }, user);
};

/**
 * Product performance profit, velocities, and category breakdowns.
 */
const getProductPerformanceReport = async (filters = {}, user = "System") => {
  return await wrapReport("Product Performance Report", filters, async () => {
    const performance = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productId",
          productName: { $first: "$orderItems.productName" },
          productCode: { $first: "$orderItems.productCode" },
          quantitySold: { $sum: "$orderItems.quantity" },
          revenue: { $sum: "$orderItems.amount" },
        },
      },
      { $sort: { quantitySold: -1 } },
    ]);

    const categories = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.category",
          totalQuantity: { $sum: "$orderItems.quantity" },
          revenue: { $sum: "$orderItems.amount" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return {
      summary: { totalUniqueProductsSold: performance.length },
      charts: { categories },
      tables: { performance },
    };
  }, user);
};

// EXPORT PLACEHOLDER INTERFACES
const exportSalesReport = async () => { throw new Error("Export feature coming soon."); };
const exportPurchaseReport = async () => { throw new Error("Export feature coming soon."); };
const exportInventoryReport = async () => { throw new Error("Export feature coming soon."); };
const exportCustomerReport = async () => { throw new Error("Export feature coming soon."); };
const exportSupplierReport = async () => { throw new Error("Export feature coming soon."); };
const exportPaymentReport = async () => { throw new Error("Export feature coming soon."); };
const exportOutstandingReport = async () => { throw new Error("Export feature coming soon."); };
const exportProductReport = async () => { throw new Error("Export feature coming soon."); };

module.exports = {
  getDashboardSummary,
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getCustomerReport,
  getSupplierReport,
  getPaymentReport,
  getOutstandingReport,
  getProductPerformanceReport,
  exportSalesReport,
  exportPurchaseReport,
  exportInventoryReport,
  exportCustomerReport,
  exportSupplierReport,
  exportPaymentReport,
  exportOutstandingReport,
  exportProductReport,
};
