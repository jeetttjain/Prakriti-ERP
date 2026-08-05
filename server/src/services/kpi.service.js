const mongoose = require("mongoose");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Purchase = require("../models/Purchase");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");

/**
 * Builds reusable Mongoose match filter conditions based on Global Filter parameters.
 * @param {Object} query Global query parameters
 * @returns {Object} Match query object for MongoDB aggregations
 */
const buildGlobalFilter = (query = {}) => {
  const match = {};

  // Date Range Filtering
  if (query.startDate || query.endDate) {
    match.createdAt = {};
    if (query.startDate) match.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) match.createdAt.$lte = new Date(query.endDate);
  } else if (query.timeframe) {
    const now = new Date();
    let start = new Date();

    switch (query.timeframe) {
      case "today":
        start.setHours(0, 0, 0, 0);
        match.createdAt = { $gte: start };
        break;
      case "thisWeek":
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        match.createdAt = { $gte: start };
        break;
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        match.createdAt = { $gte: start };
        break;
      case "thisQuarter":
        const currentQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), currentQuarterMonth, 1);
        match.createdAt = { $gte: start };
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        match.createdAt = { $gte: start };
        break;
      default:
        break;
    }
  }

  // Branch & Warehouse Filtering
  if (query.branchId && mongoose.Types.ObjectId.isValid(query.branchId)) {
    match.branchId = new mongoose.Types.ObjectId(query.branchId);
  }
  if (query.warehouseId && mongoose.Types.ObjectId.isValid(query.warehouseId)) {
    match.warehouseId = new mongoose.Types.ObjectId(query.warehouseId);
  }

  // Customer & Supplier Filtering
  if (query.customerId && mongoose.Types.ObjectId.isValid(query.customerId)) {
    match["customerSnapshot._id"] = new mongoose.Types.ObjectId(query.customerId);
  }
  if (query.supplierId && mongoose.Types.ObjectId.isValid(query.supplierId)) {
    match.supplierId = new mongoose.Types.ObjectId(query.supplierId);
  }

  // Sales Executive Filtering
  if (query.salesExecutive) {
    match.createdBy = query.salesExecutive;
  }

  return match;
};

/**
 * Reusable BI & Analytics KPI Engine calculating enterprise performance indicators.
 */
const calculateKPIs = async (query = {}) => {
  const filter = buildGlobalFilter(query);

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const currentYearStart = new Date(now.getFullYear(), 0, 1);
  const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const prevYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

  const [
    revenueAgg,
    prevMonthRevAgg,
    prevYearRevAgg,
    orderAgg,
    purchaseAgg,
    customerAgg,
    prevMonthCustAgg,
    repeatCustAgg,
  ] = await Promise.all([
    // Current total revenue
    Invoice.aggregate([
      { $match: { ...filter, status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    // Previous month revenue
    Invoice.aggregate([
      { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]),
    // Previous year revenue
    Invoice.aggregate([
      { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: prevYearStart, $lte: prevYearEnd } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]),
    // Order stats
    Order.aggregate([
      { $match: filter },
      { $group: { _id: null, totalOrders: { $sum: 1 }, totalValue: { $sum: "$grandTotal" } } },
    ]),
    // Purchase stats (expenses)
    Purchase.aggregate([
      { $match: filter },
      { $group: { _id: null, totalPurchases: { $sum: 1 }, totalExpenses: { $sum: "$totalAmount" } } },
    ]),
    // Customer count
    Customer.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: null, totalActive: { $sum: 1 } } },
    ]),
    // Previous month customer count
    Customer.aggregate([
      { $match: { createdAt: { $lte: prevMonthEnd } } },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]),
    // Repeat Customers (Customers with > 1 order)
    Order.aggregate([
      { $match: filter },
      { $group: { _id: "$customerSnapshot._id", orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]),
  ]);

  const revenue = revenueAgg[0]?.totalRevenue || 0;
  const prevMonthRevenue = prevMonthRevAgg[0]?.totalRevenue || 0;
  const prevYearRevenue = prevYearRevAgg[0]?.totalRevenue || 0;

  const totalOrders = orderAgg[0]?.totalOrders || 0;
  const totalOrderValue = orderAgg[0]?.totalValue || 0;

  const totalExpenses = purchaseAgg[0]?.totalExpenses || 0;
  const totalPurchases = purchaseAgg[0]?.totalPurchases || 0;

  const totalCustomers = customerAgg[0]?.totalActive || 0;
  const prevMonthCustomers = prevMonthCustAgg[0]?.total || 0;
  const repeatCustomers = repeatCustAgg[0]?.count || 0;

  // Derived Calculations
  const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;
  const averagePurchaseValue = totalPurchases > 0 ? totalExpenses / totalPurchases : 0;
  const grossProfit = revenue - totalExpenses;
  const grossMarginPct = revenue > 0 ? ((revenue - totalExpenses) / revenue) * 100 : 0;
  const repeatCustomerPct = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

  const momRevenueGrowthPct = prevMonthRevenue > 0 ? ((revenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;
  const yoyRevenueGrowthPct = prevYearRevenue > 0 ? ((revenue - prevYearRevenue) / prevYearRevenue) * 100 : 0;
  const momCustomerGrowthPct = prevMonthCustomers > 0 ? ((totalCustomers - prevMonthCustomers) / prevMonthCustomers) * 100 : 0;

  return {
    revenue,
    prevMonthRevenue,
    prevYearRevenue,
    momRevenueGrowthPct: Number(momRevenueGrowthPct.toFixed(2)),
    yoyRevenueGrowthPct: Number(yoyRevenueGrowthPct.toFixed(2)),
    totalOrders,
    totalOrderValue,
    averageOrderValue: Number(averageOrderValue.toFixed(2)),
    totalExpenses,
    totalPurchases,
    averagePurchaseValue: Number(averagePurchaseValue.toFixed(2)),
    grossProfit,
    grossMarginPct: Number(grossMarginPct.toFixed(2)),
    totalCustomers,
    repeatCustomers,
    repeatCustomerPct: Number(repeatCustomerPct.toFixed(2)),
    momCustomerGrowthPct: Number(momCustomerGrowthPct.toFixed(2)),
  };
};

module.exports = {
  buildGlobalFilter,
  calculateKPIs,
};
