const mongoose = require("mongoose");
const Order = require("../models/Order");
const Purchase = require("../models/Purchase");
const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");

const reportService = require("./report.service");
const { buildPaginationResult } = require("./pagination.service");
const {
  buildDateFilter,
  buildEntityFilter,
  buildSearchFilter,
  buildSortOptions,
  buildPagination,
  mergeFilters,
} = require("./reportFilter.service");

/**
 * 1. Sales Summary Report
 * GET /api/reports/sales-summary
 */
const getSalesSummary = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "orderDate");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, ["orderNumber", "customerSnapshot.businessName"]);

  const match = mergeFilters(
    { orderStatus: { $ne: "Cancelled" } },
    dateFilter,
    entityFilter,
    searchFilter
  );

  const summaryResult = await Order.aggregate([
    { $match: match },
    {
      $unwind: {
        path: "$orderItems",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        grandTotal: { $first: "$grandTotal" },
        orderQty: { $sum: "$orderItems.quantity" },
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$grandTotal" },
        averageOrderValue: { $avg: "$grandTotal" },
        totalQuantitySold: { $sum: "$orderQty" },
      },
    },
  ]);

  const totalOrders = summaryResult[0]?.totalOrders || 0;
  const totalRevenue = summaryResult[0]?.totalRevenue || 0;
  const averageOrderValue = summaryResult[0]?.averageOrderValue || 0;
  const totalQuantitySold = summaryResult[0]?.totalQuantitySold || 0;

  const dailySales = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate", timezone: "UTC" } },
        totalSales: { $sum: "$grandTotal" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", totalSales: 1, count: 1 } },
  ]);

  const weeklySales = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $isoWeek: "$orderDate" },
        year: { $isoWeekYear: "$orderDate" },
        totalSales: { $sum: "$grandTotal" },
        count: { $sum: 1 },
      },
    },
    { $sort: { year: 1, _id: 1 } },
    { $project: { _id: 0, week: "$_id", year: 1, totalSales: 1, count: 1 } },
  ]);

  const monthlySales = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$orderDate", timezone: "UTC" } },
        totalSales: { $sum: "$grandTotal" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, month: "$_id", totalSales: 1, count: 1 } },
  ]);

  return {
    summary: {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalQuantitySold,
    },
    dailySales,
    weeklySales,
    monthlySales,
  };
};

/**
 * 2. Top Products Report
 * GET /api/reports/top-products
 */
const getTopProducts = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "orderDate");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, [
    "orderItems.productName",
    "orderItems.productCode",
    "orderItems.category",
  ]);
  const { page, limit, skip } = buildPagination(query.page, query.limit);
  const sortOptions = buildSortOptions(query.sortBy, query.sortOrder, "revenue", -1);

  const match = mergeFilters(
    { orderStatus: { $ne: "Cancelled" } },
    dateFilter,
    entityFilter
  );

  const pipeline = [
    { $match: match },
    { $unwind: "$orderItems" },
  ];

  if (Object.keys(searchFilter).length > 0) {
    pipeline.push({ $match: searchFilter });
  }

  pipeline.push(
    {
      $group: {
        _id: "$orderItems.productId",
        productName: { $first: "$orderItems.productName" },
        productCode: { $first: "$orderItems.productCode" },
        category: { $first: "$orderItems.category" },
        unit: { $first: "$orderItems.unit" },
        quantitySold: { $sum: "$orderItems.quantity" },
        revenue: { $sum: "$orderItems.amount" },
      },
    },
    {
      $project: {
        _id: 1,
        product: {
          _id: "$_id",
          productName: "$productName",
          productCode: "$productCode",
          category: "$category",
          unit: "$unit",
        },
        quantitySold: 1,
        revenue: 1,
        averageSellingPrice: {
          $cond: [{ $gt: ["$quantitySold", 0] }, { $divide: ["$revenue", "$quantitySold"] }, 0],
        },
      },
    }
  );

  const countPipeline = [...pipeline, { $count: "totalRecords" }];
  const countRes = await Order.aggregate(countPipeline);
  const totalRecords = countRes[0]?.totalRecords || 0;

  pipeline.push({ $sort: sortOptions }, { $skip: skip }, { $limit: limit });

  const rows = await Order.aggregate(pipeline);

  return buildPaginationResult(rows, totalRecords, page, limit, "totalProducts");
};

/**
 * 3. Top Customers Report
 * GET /api/reports/top-customers
 */
const getTopCustomers = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "orderDate");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, [
    "customerSnapshot.businessName",
    "customerSnapshot.contactPerson",
    "customerSnapshot.contactNumber",
  ]);
  const { page, limit, skip } = buildPagination(query.page, query.limit);
  const sortOptions = buildSortOptions(query.sortBy, query.sortOrder, "revenue", -1);

  const match = mergeFilters(
    { orderStatus: { $ne: "Cancelled" } },
    dateFilter,
    entityFilter,
    searchFilter
  );

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: "$customerId",
        customerSnapshot: { $first: "$customerSnapshot" },
        orders: { $sum: 1 },
        revenue: { $sum: "$grandTotal" },
      },
    },
    {
      $lookup: {
        from: "invoices",
        let: { custId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$customerId", "$$custId"] },
              isDeleted: { $ne: true },
              paymentStatus: { $in: ["Pending", "Partial", "Unpaid", "Partially Paid"] },
            },
          },
          {
            $group: {
              _id: null,
              totalOutstanding: {
                $sum: { $ifNull: ["$paymentSummary.outstandingAmount", "$grandTotal"] },
              },
            },
          },
        ],
        as: "invOutstanding",
      },
    },
    {
      $project: {
        _id: 1,
        customer: {
          _id: "$_id",
          businessName: "$customerSnapshot.businessName",
          contactPerson: "$customerSnapshot.contactPerson",
          contactNumber: "$customerSnapshot.contactNumber",
          whatsappNumber: "$customerSnapshot.whatsappNumber",
        },
        orders: 1,
        revenue: 1,
        outstanding: { $ifNull: [{ $arrayElemAt: ["$invOutstanding.totalOutstanding", 0] }, 0] },
      },
    },
  ];

  const countRes = await Order.aggregate([...pipeline, { $count: "totalRecords" }]);
  const totalRecords = countRes[0]?.totalRecords || 0;

  pipeline.push({ $sort: sortOptions }, { $skip: skip }, { $limit: limit });

  const rows = await Order.aggregate(pipeline);

  return buildPaginationResult(rows, totalRecords, page, limit, "totalCustomers");
};

/**
 * 4. Purchase Summary Report
 * GET /api/reports/purchase-summary
 */
const getPurchaseSummary = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "purchaseDate");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, [
    "purchaseNumber",
    "supplierSnapshot.businessName",
  ]);

  const match = mergeFilters(
    { purchaseStatus: { $ne: "Cancelled" } },
    dateFilter,
    entityFilter,
    searchFilter
  );

  const stats = await Purchase.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalPurchases: { $sum: 1 },
        purchaseValue: { $sum: "$grandTotal" },
        suppliers: { $addToSet: "$supplierId" },
        pendingPurchases: {
          $sum: {
            $cond: [{ $in: ["$purchaseStatus", ["Draft", "Ordered"]] }, 1, 0],
          },
        },
      },
    },
  ]);

  const totalPurchases = stats[0]?.totalPurchases || 0;
  const purchaseValue = stats[0]?.purchaseValue || 0;
  const supplierCount = stats[0]?.suppliers ? stats[0].suppliers.length : 0;
  const pendingPurchases = stats[0]?.pendingPurchases || 0;

  return {
    summary: {
      totalPurchases,
      supplierCount,
      purchaseValue,
      pendingPurchases,
    },
  };
};

/**
 * 5. Top Suppliers Report
 * GET /api/reports/top-suppliers
 */
const getTopSuppliers = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "purchaseDate");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, [
    "supplierSnapshot.businessName",
    "supplierSnapshot.personName",
    "supplierSnapshot.mobile",
  ]);
  const { page, limit, skip } = buildPagination(query.page, query.limit);
  const sortOptions = buildSortOptions(query.sortBy, query.sortOrder, "purchaseAmount", -1);

  const match = mergeFilters(
    { purchaseStatus: { $ne: "Cancelled" } },
    dateFilter,
    entityFilter,
    searchFilter
  );

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: "$supplierId",
        supplierSnapshot: { $first: "$supplierSnapshot" },
        purchaseAmount: { $sum: "$grandTotal" },
        orders: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        supplier: {
          _id: "$_id",
          businessName: "$supplierSnapshot.businessName",
          personName: "$supplierSnapshot.personName",
          mobile: "$supplierSnapshot.mobile",
        },
        purchaseAmount: 1,
        orders: 1,
        averagePurchase: {
          $cond: [{ $gt: ["$orders", 0] }, { $divide: ["$purchaseAmount", "$orders"] }, 0],
        },
      },
    },
  ];

  const countRes = await Purchase.aggregate([...pipeline, { $count: "totalRecords" }]);
  const totalRecords = countRes[0]?.totalRecords || 0;

  pipeline.push({ $sort: sortOptions }, { $skip: skip }, { $limit: limit });

  const rows = await Purchase.aggregate(pipeline);

  return buildPaginationResult(rows, totalRecords, page, limit, "totalSuppliers");
};

/**
 * 6. Inventory Summary Report
 * GET /api/reports/inventory-summary
 */
const getInventorySummary = async (query = {}) => {
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, ["inventoryCode", "location"]);

  const match = mergeFilters(entityFilter, searchFilter);

  const stats = await Inventory.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        inventoryValue: {
          $sum: { $multiply: ["$currentStock", { $ifNull: ["$product.purchasePrice", 0] }] },
        },
        reservedStock: { $sum: "$reservedStock" },
        availableStock: { $sum: "$availableStock" },
        lowStock: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gt: ["$currentStock", 0] },
                  { $lte: ["$currentStock", "$minimumStock"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        outOfStock: {
          $sum: { $cond: [{ $eq: ["$currentStock", 0] }, 1, 0] },
        },
      },
    },
  ]);

  return {
    summary: {
      inventoryValue: stats[0]?.inventoryValue || 0,
      lowStock: stats[0]?.lowStock || 0,
      outOfStock: stats[0]?.outOfStock || 0,
      reservedStock: stats[0]?.reservedStock || 0,
      availableStock: stats[0]?.availableStock || 0,
    },
  };
};

/**
 * 7. Stock Movement Report
 * GET /api/reports/stock-movement
 */
const getStockMovement = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "createdAt");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, [
    "movementNumber",
    "referenceNumber",
    "movementReason",
    "remarks",
  ]);
  const { page, limit, skip } = buildPagination(query.page, query.limit);
  const sortOptions = buildSortOptions(query.sortBy, query.sortOrder, "createdAt", -1);

  const match = mergeFilters(dateFilter, entityFilter, searchFilter);

  const movementTotals = await StockMovement.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$movementType",
        totalQuantity: { $sum: "$quantity" },
      },
    },
  ]);

  const map = {};
  movementTotals.forEach((m) => {
    map[m._id] = m.totalQuantity;
  });

  const opening = map["Opening Stock"] || 0;
  const purchase = map["Purchase"] || 0;
  const reservation = map["Reservation"] || 0;
  const delivery = map["Delivery"] || 0;
  const adjustment =
    (map["Manual Adjustment"] || 0) +
    (map["Stock Correction"] || 0) +
    (map["Damage"] || 0) +
    (map["Inventory Audit"] || 0);

  const currentInventoryAgg = await Inventory.aggregate([
    { $group: { _id: null, totalCurrent: { $sum: "$currentStock" } } },
  ]);
  const closing = currentInventoryAgg[0]?.totalCurrent || 0;

  const totalRecords = await StockMovement.countDocuments(match);

  const history = await StockMovement.find(match)
    .populate("productId", "productName productCode unit category")
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  const paginationPayload = buildPaginationResult(history, totalRecords, page, limit, "totalMovements");

  return {
    summary: {
      opening,
      purchase,
      reservation,
      delivery,
      adjustment,
      closing,
    },
    ...paginationPayload,
  };
};

/**
 * 8. Receivables Report (Financial Structure: { summary, rows })
 * GET /api/reports/receivables
 */
const getReceivables = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "invoiceDate");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, [
    "invoiceNumber",
    "customerSnapshot.businessName",
  ]);
  const { page, limit, skip } = buildPagination(query.page, query.limit);
  const sortOptions = buildSortOptions(query.sortBy, query.sortOrder, "outstanding", -1);

  const match = mergeFilters(
    {
      invoiceStatus: { $ne: "Cancelled" },
      paymentStatus: { $in: ["Pending", "Partial", "Unpaid", "Partially Paid"] },
    },
    dateFilter,
    entityFilter,
    searchFilter
  );

  const now = new Date();

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: "$customerId",
        customerSnapshot: { $first: "$customerSnapshot" },
        outstanding: {
          $sum: { $ifNull: ["$paymentSummary.outstandingAmount", "$grandTotal"] },
        },
        overdue: {
          $sum: {
            $cond: [
              { $lt: ["$dueDate", now] },
              { $ifNull: ["$paymentSummary.outstandingAmount", "$grandTotal"] },
              0,
            ],
          },
        },
        invoiceCount: { $sum: 1 },
        invoices: {
          $push: {
            invoiceId: "$_id",
            invoiceNumber: "$invoiceNumber",
            invoiceDate: "$invoiceDate",
            dueDate: "$dueDate",
            grandTotal: "$grandTotal",
            outstandingAmount: { $ifNull: ["$paymentSummary.outstandingAmount", "$grandTotal"] },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        customer: {
          _id: "$_id",
          businessName: "$customerSnapshot.businessName",
          contactPerson: "$customerSnapshot.contactPerson",
          contactNumber: "$customerSnapshot.contactNumber",
        },
        outstanding: 1,
        overdue: 1,
        invoiceCount: 1,
        invoices: 1,
      },
    },
  ];

  const countRes = await Invoice.aggregate([...pipeline, { $count: "totalRecords" }]);
  const totalRecords = countRes[0]?.totalRecords || 0;

  const totalSummaryRes = await Invoice.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOutstanding: {
          $sum: { $ifNull: ["$paymentSummary.outstandingAmount", "$grandTotal"] },
        },
        totalOverdue: {
          $sum: {
            $cond: [
              { $lt: ["$dueDate", now] },
              { $ifNull: ["$paymentSummary.outstandingAmount", "$grandTotal"] },
              0,
            ],
          },
        },
      },
    },
  ]);

  pipeline.push({ $sort: sortOptions }, { $skip: skip }, { $limit: limit });
  const rows = await Invoice.aggregate(pipeline);

  const paginationPayload = buildPaginationResult(rows, totalRecords, page, limit, "totalCustomers");

  return {
    summary: {
      totalOutstanding: totalSummaryRes[0]?.totalOutstanding || 0,
      totalOverdue: totalSummaryRes[0]?.totalOverdue || 0,
      customerCount: totalRecords,
    },
    ...paginationPayload,
  };
};

/**
 * 9. Payables Report (Financial Structure: { summary, rows })
 * GET /api/reports/payables
 */
const getPayables = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "purchaseDate");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, [
    "purchaseNumber",
    "supplierSnapshot.businessName",
  ]);
  const { page, limit, skip } = buildPagination(query.page, query.limit);
  const sortOptions = buildSortOptions(query.sortBy, query.sortOrder, "outstanding", -1);

  const match = mergeFilters(
    { purchaseStatus: { $in: ["Draft", "Ordered"] } },
    dateFilter,
    entityFilter,
    searchFilter
  );

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: "$supplierId",
        supplierSnapshot: { $first: "$supplierSnapshot" },
        outstanding: { $sum: "$grandTotal" },
        pendingPurchasesCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        supplier: {
          _id: "$_id",
          businessName: "$supplierSnapshot.businessName",
          personName: "$supplierSnapshot.personName",
          mobile: "$supplierSnapshot.mobile",
        },
        outstanding: 1,
        pendingPurchasesCount: 1,
      },
    },
  ];

  const countRes = await Purchase.aggregate([...pipeline, { $count: "totalRecords" }]);
  const totalRecords = countRes[0]?.totalRecords || 0;

  const totalSummaryRes = await Purchase.aggregate([
    { $match: match },
    { $group: { _id: null, totalPayables: { $sum: "$grandTotal" } } },
  ]);

  pipeline.push({ $sort: sortOptions }, { $skip: skip }, { $limit: limit });
  const rows = await Purchase.aggregate(pipeline);

  const paginationPayload = buildPaginationResult(rows, totalRecords, page, limit, "totalSuppliers");

  return {
    summary: {
      totalPayables: totalSummaryRes[0]?.totalPayables || 0,
      supplierCount: totalRecords,
    },
    ...paginationPayload,
  };
};

/**
 * 10. Payment Summary Report (Financial Structure: { summary, rows })
 * GET /api/reports/payment-summary
 */
const getPaymentSummary = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "paymentDate");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, [
    "paymentNumber",
    "receiptNumber",
    "paymentReference",
  ]);
  const { page, limit, skip } = buildPagination(query.page, query.limit);
  const sortOptions = buildSortOptions(query.sortBy, query.sortOrder, "paymentDate", -1);

  const match = mergeFilters(dateFilter, entityFilter, searchFilter);

  const totals = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$paymentStatus",
        totalAmount: { $sum: "$amountReceived" },
        count: { $sum: 1 },
      },
    },
  ]);

  let collections = 0;
  let pending = 0;
  let partial = 0;
  let completed = 0;

  totals.forEach((t) => {
    if (t._id === "Completed") {
      collections += t.totalAmount;
      completed += t.totalAmount;
    } else if (t._id === "Pending") {
      pending += t.totalAmount;
    }
  });

  const partialTotals = await Payment.aggregate([
    { $match: { ...match, paymentType: "Partial Payment" } },
    { $group: { _id: null, total: { $sum: "$amountReceived" } } },
  ]);
  partial = partialTotals[0]?.total || 0;

  const totalRecords = await Payment.countDocuments(match);
  const rows = await Payment.find(match)
    .populate("customerId", "businessName personName contactNumber")
    .populate("invoiceId", "invoiceNumber grandTotal")
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  const paginationPayload = buildPaginationResult(rows, totalRecords, page, limit, "totalPayments");

  return {
    summary: {
      collections,
      pending,
      partial,
      completed,
    },
    ...paginationPayload,
  };
};

/**
 * 11. Customer Analytics (Analytics Structure: { summary, items })
 * GET /api/reports/customer-analytics
 */
const getCustomerAnalytics = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "orderDate");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, [
    "customerSnapshot.businessName",
    "customerSnapshot.contactPerson",
  ]);
  const { page, limit, skip } = buildPagination(query.page, query.limit);
  const sortOptions = buildSortOptions(query.sortBy, query.sortOrder, "totalSpent", -1);

  const match = mergeFilters(
    { orderStatus: { $ne: "Cancelled" } },
    dateFilter,
    entityFilter,
    searchFilter
  );

  const customerStats = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$customerId",
        customerSnapshot: { $first: "$customerSnapshot" },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$grandTotal" },
        firstOrderDate: { $min: "$orderDate" },
        lastOrderDate: { $max: "$orderDate" },
      },
    },
    {
      $project: {
        _id: 1,
        customer: {
          _id: "$_id",
          businessName: "$customerSnapshot.businessName",
          contactPerson: "$customerSnapshot.contactPerson",
        },
        totalOrders: 1,
        totalSpent: 1,
        averageOrderValue: {
          $cond: [{ $gt: ["$totalOrders", 0] }, { $divide: ["$totalSpent", "$totalOrders"] }, 0],
        },
        firstOrderDate: 1,
        lastOrderDate: 1,
        isRepeat: { $gt: ["$totalOrders", 1] },
      },
    },
  ]);

  const activeCustomers = await Customer.countDocuments({ status: "Active" });

  let newCustomers = 0;
  if (query.from || query.to) {
    const custDateFilter = buildDateFilter(query.from, query.to, "createdAt");
    newCustomers = await Customer.countDocuments(custDateFilter);
  } else {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    newCustomers = await Customer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  }

  const repeatCustomers = customerStats.filter((c) => c.isRepeat).length;
  const overallAvgPurchase =
    customerStats.length > 0
      ? customerStats.reduce((sum, c) => sum + c.totalSpent, 0) /
        customerStats.reduce((sum, c) => sum + c.totalOrders, 0)
      : 0;

  const totalRecords = customerStats.length;
  const sortedItems = customerStats.sort((a, b) => {
    const key = Object.keys(sortOptions)[0];
    const order = sortOptions[key];
    return (a[key] > b[key] ? 1 : -1) * order;
  });

  const paginatedItems = sortedItems.slice(skip, skip + limit);
  const paginationPayload = buildPaginationResult(paginatedItems, totalRecords, page, limit, "totalCustomers");

  return {
    summary: {
      activeCustomers,
      newCustomers,
      repeatCustomers,
      averagePurchase: overallAvgPurchase,
    },
    ...paginationPayload,
  };
};

/**
 * 12. Product Analytics (Analytics Structure: { summary, items })
 * GET /api/reports/product-analytics
 */
const getProductAnalytics = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "orderDate");
  const entityFilter = buildEntityFilter(query);
  const { page, limit, skip } = buildPagination(query.page, query.limit);

  const match = mergeFilters({ orderStatus: { $ne: "Cancelled" } }, dateFilter, entityFilter);

  const productSales = await Order.aggregate([
    { $match: match },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.productId",
        productName: { $first: "$orderItems.productName" },
        productCode: { $first: "$orderItems.productCode" },
        category: { $first: "$orderItems.category" },
        unit: { $first: "$orderItems.unit" },
        quantitySold: { $sum: "$orderItems.quantity" },
        revenue: { $sum: "$orderItems.amount" },
      },
    },
  ]);

  const salesMap = new Map();
  productSales.forEach((p) => {
    salesMap.set(p._id.toString(), p);
  });

  const allProducts = await Product.find({ status: { $ne: "Archived" } }).lean();

  const items = allProducts.map((prod) => {
    const s = salesMap.get(prod._id.toString());
    const qty = s ? s.quantitySold : 0;
    const rev = s ? s.revenue : 0;
    const cost = prod.purchasePrice || 0;
    const price = prod.sellingPrice || 0;
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

    return {
      product: {
        _id: prod._id,
        productName: prod.productName,
        productCode: prod.productCode,
        category: prod.category,
        unit: prod.unit,
      },
      quantitySold: qty,
      revenue: rev,
      purchasePrice: cost,
      sellingPrice: price,
      marginPercentage: margin,
    };
  });

  const fastMoving = [...items].sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 10);
  const slowMoving = items.filter((i) => i.quantitySold > 0).sort((a, b) => a.quantitySold - b.quantitySold).slice(0, 10);
  const neverSold = items.filter((i) => i.quantitySold === 0);
  const highestMargin = [...items].sort((a, b) => b.marginPercentage - a.marginPercentage).slice(0, 10);

  const totalRecords = items.length;
  const paginatedItems = items.slice(skip, skip + limit);
  const paginationPayload = buildPaginationResult(paginatedItems, totalRecords, page, limit, "totalProducts");

  return {
    summary: {
      totalProducts: totalRecords,
      fastMovingCount: fastMoving.length,
      slowMovingCount: slowMoving.length,
      neverSoldCount: neverSold.length,
    },
    fastMoving,
    slowMoving,
    neverSold,
    highestMargin,
    ...paginationPayload,
  };
};

/**
 * 13. Supplier Analytics (Analytics Structure: { summary, items })
 * GET /api/reports/supplier-analytics
 */
const getSupplierAnalytics = async (query = {}) => {
  const dateFilter = buildDateFilter(query.from, query.to, "purchaseDate");
  const entityFilter = buildEntityFilter(query);
  const searchFilter = buildSearchFilter(query.search, [
    "supplierSnapshot.businessName",
    "supplierSnapshot.personName",
  ]);
  const { page, limit, skip } = buildPagination(query.page, query.limit);

  const match = mergeFilters(
    { purchaseStatus: { $ne: "Cancelled" } },
    dateFilter,
    entityFilter,
    searchFilter
  );

  const stats = await Purchase.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$supplierId",
        supplierSnapshot: { $first: "$supplierSnapshot" },
        purchaseValue: { $sum: "$grandTotal" },
        ordersCount: { $sum: 1 },
        deliveredCount: {
          $sum: { $cond: [{ $eq: ["$purchaseStatus", "Received"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 1,
        supplier: {
          _id: "$_id",
          businessName: "$supplierSnapshot.businessName",
          personName: "$supplierSnapshot.personName",
        },
        purchaseValue: 1,
        ordersCount: 1,
        deliveredCount: 1,
        deliveryPerformance: {
          $cond: [{ $gt: ["$ordersCount", 0] }, { $multiply: [{ $divide: ["$deliveredCount", "$ordersCount"] }, 100] }, 0],
        },
      },
    },
  ]);

  const activeSuppliers = await Supplier.countDocuments({ status: "Active" });
  const totalPurchaseVal = stats.reduce((sum, s) => sum + s.purchaseValue, 0);
  const avgDeliveryPerf =
    stats.length > 0
      ? stats.reduce((sum, s) => sum + s.deliveryPerformance, 0) / stats.length
      : 100;

  const totalRecords = stats.length;
  const paginatedItems = stats.slice(skip, skip + limit);
  const paginationPayload = buildPaginationResult(paginatedItems, totalRecords, page, limit, "totalSuppliers");

  return {
    summary: {
      activeSuppliers,
      purchaseValue: totalPurchaseVal,
      deliveryPerformance: avgDeliveryPerf,
    },
    ...paginationPayload,
  };
};

module.exports = {
  getSalesSummary,
  getTopProducts,
  getTopCustomers,
  getPurchaseSummary,
  getTopSuppliers,
  getInventorySummary,
  getStockMovement,
  getReceivables,
  getPayables,
  getPaymentSummary,
  getCustomerAnalytics,
  getProductAnalytics,
  getSupplierAnalytics,
};
