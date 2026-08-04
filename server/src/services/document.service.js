const Invoice = require("../models/Invoice");
const Purchase = require("../models/Purchase");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Inventory = require("../models/Inventory");

const templateService = require("./documentTemplate.service");
const excelService = require("./excel.service");
const csvService = require("./csv.service");
const qrService = require("./qr.service");
const settingsService = require("./settings.service");
const reportAnalyticsService = require("./reportAnalytics.service");
const auditLogService = require("./auditLog.service");

/**
 * Loads dynamic branding details from Settings database model.
 */
const getCompanyBranding = async () => {
  try {
    const settings = await settingsService.getSettings();
    return {
      name: settings.companyName || "Prakriti Vegetable Supplier",
      tagline: settings.tagline || "Fresh Farm Produce & B2B Supply Chain Solutions",
      address: settings.address || "Plot No. 42, Mandi Complex, Sector 18, New Delhi - 110001",
      phone: settings.phone || "+91 98765 43210",
      email: settings.email || "billing@prakritiveg.com",
      website: settings.website || "www.prakritiveg.com",
      gstin: settings.gstNumber || "07AAAAA0000A1Z5",
    };
  } catch {
    return templateService.COMPANY_DETAILS;
  }
};

/**
 * Generate Invoice PDF HTML
 */
const generateInvoicePDF = async (invoiceId, user = null) => {
  const invoice = await Invoice.findById(invoiceId).lean();
  if (!invoice) {
    const err = new Error("Invoice not found.");
    err.statusCode = 404;
    throw err;
  }

  const company = await getCompanyBranding();
  if (user) {
    await auditLogService.logEvent({ module: "Invoices", action: "Export PDF", performedBy: user.email || user._id, targetId: invoice._id });
  }

  return {
    filename: `Invoice_${invoice.invoiceNumber}.html`,
    html: templateService.renderInvoiceHTML(invoice, company),
    invoice,
  };
};

/**
 * Generate Thermal Invoice HTML
 */
const generateInvoiceThermal = async (invoiceId, user = null) => {
  const invoice = await Invoice.findById(invoiceId).lean();
  if (!invoice) {
    const err = new Error("Invoice not found.");
    err.statusCode = 404;
    throw err;
  }

  const company = await getCompanyBranding();
  return {
    filename: `Thermal_Invoice_${invoice.invoiceNumber}.html`,
    html: templateService.renderThermalReceiptHTML(invoice, "invoice", company),
    invoice,
  };
};

/**
 * Generate Purchase Order PDF HTML
 */
const generatePurchaseOrderPDF = async (purchaseId, user = null) => {
  const purchase = await Purchase.findById(purchaseId).lean();
  if (!purchase) {
    const err = new Error("Purchase Order not found.");
    err.statusCode = 404;
    throw err;
  }

  const company = await getCompanyBranding();
  if (user) {
    await auditLogService.logEvent({ module: "Purchases", action: "Export PDF", performedBy: user.email || user._id, targetId: purchase._id });
  }

  return {
    filename: `Purchase_${purchase.purchaseNumber}.html`,
    html: templateService.renderPurchaseOrderHTML(purchase, company),
    purchase,
  };
};

/**
 * Generate Payment Receipt PDF HTML
 */
const generatePaymentReceiptPDF = async (paymentId, user = null) => {
  const payment = await Payment.findById(paymentId)
    .populate("customerId", "businessName personName contactNumber mobile")
    .populate("invoiceId", "invoiceNumber grandTotal")
    .lean();

  if (!payment) {
    const err = new Error("Payment record not found.");
    err.statusCode = 404;
    throw err;
  }

  const company = await getCompanyBranding();
  if (user) {
    await auditLogService.logEvent({ module: "Payments", action: "Export Receipt PDF", performedBy: user.email || user._id, targetId: payment._id });
  }

  return {
    filename: `Receipt_${payment.receiptNumber}.html`,
    html: templateService.renderPaymentReceiptHTML(payment, company),
    payment,
  };
};

/**
 * Generate Thermal Payment Receipt HTML
 */
const generatePaymentThermal = async (paymentId, user = null) => {
  const payment = await Payment.findById(paymentId)
    .populate("customerId", "businessName personName contactNumber mobile")
    .lean();

  if (!payment) {
    const err = new Error("Payment record not found.");
    err.statusCode = 404;
    throw err;
  }

  const company = await getCompanyBranding();
  return {
    filename: `Thermal_Receipt_${payment.receiptNumber}.html`,
    html: templateService.renderThermalReceiptHTML(payment, "payment", company),
    payment,
  };
};

/**
 * Generate Delivery Challan PDF HTML
 */
const generateDeliveryChallanPDF = async (orderId, user = null) => {
  const order = await Order.findById(orderId).lean();
  if (!order) {
    const err = new Error("Order not found.");
    err.statusCode = 404;
    throw err;
  }

  const company = await getCompanyBranding();
  return {
    filename: `Challan_${order.orderNumber}.html`,
    html: templateService.renderDeliveryChallanHTML(order, company),
    order,
  };
};

/**
 * Generate Customer Statement PDF HTML
 */
const generateCustomerStatementPDF = async (customerId, user = null) => {
  const customer = await Customer.findById(customerId).lean();
  if (!customer) {
    const err = new Error("Customer not found.");
    err.statusCode = 404;
    throw err;
  }

  const invoices = await Invoice.find({ customerId, isDeleted: { $ne: true } }).lean();
  const payments = await Payment.find({ customerId, isDeleted: { $ne: true } }).lean();

  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.grandTotal || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + (p.amountReceived || 0), 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalPaid);

  const company = await getCompanyBranding();
  return {
    filename: `Customer_Statement_${customer.businessName.replace(/\s+/g, "_")}.html`,
    html: templateService.renderCustomerStatementHTML(customer, invoices, payments, { totalInvoiced, totalPaid, totalOutstanding }, company),
    customer,
  };
};

/**
 * Generate Supplier Statement PDF HTML
 */
const generateSupplierStatementPDF = async (supplierId, user = null) => {
  const supplier = await Supplier.findById(supplierId).lean();
  if (!supplier) {
    const err = new Error("Supplier partner not found.");
    err.statusCode = 404;
    throw err;
  }

  const purchases = await Purchase.find({ supplierId }).lean();
  const totalPurchased = purchases.reduce((acc, p) => acc + (p.grandTotal || 0), 0);

  const company = await getCompanyBranding();
  return {
    filename: `Supplier_Statement_${supplier.businessName.replace(/\s+/g, "_")}.html`,
    html: templateService.renderSupplierStatementHTML(supplier, purchases, { totalPurchased }, company),
    supplier,
  };
};

/**
 * Central Table Export Generator (Customers, Products, Suppliers, Orders, Purchases, Invoices, Payments, Inventory)
 */
const generateTableExport = async (tableName, format = "excel", user = null) => {
  let data = [];
  let columns = [];

  switch (tableName.toLowerCase()) {
    case "customers":
      data = await Customer.find({}).lean();
      columns = [
        { label: "Business Name", key: "businessName" },
        { label: "Contact Person", key: "personName" },
        { label: "Contact Number", key: "contactNumber" },
        { label: "WhatsApp", key: "whatsappNumber" },
        { label: "Payment Cycle (Days)", key: "paymentCycle" },
        { label: "Credit Limit", key: "creditLimit" },
        { label: "Status", key: "status" },
      ];
      break;

    case "products":
      data = await Product.find({ status: { $ne: "Archived" } }).lean();
      columns = [
        { label: "Product Code", key: "productCode" },
        { label: "Product Name", key: "productName" },
        { label: "Category", key: "category" },
        { label: "Unit", key: "unit" },
        { label: "Purchase Price", key: "purchasePrice" },
        { label: "Selling Price", key: "sellingPrice" },
        { label: "Current Stock", key: "currentStock" },
        { label: "Status", key: "status" },
      ];
      break;

    case "suppliers":
      data = await Supplier.find({}).lean();
      columns = [
        { label: "Supplier Code", key: "supplierCode" },
        { label: "Business Name", key: "businessName" },
        { label: "Person Name", key: "personName" },
        { label: "Mobile", key: "mobile" },
        { label: "GST", key: "gst" },
        { label: "Category", key: "supplierCategory" },
        { label: "Status", key: "status" },
      ];
      break;

    case "orders":
      data = await Order.find({ isDeleted: { $ne: true } }).lean();
      columns = [
        { label: "Order Number", key: "orderNumber" },
        { label: "Customer", key: "customerSnapshot.businessName" },
        { label: "Order Date", key: "orderDate" },
        { label: "Order Status", key: "orderStatus" },
        { label: "Payment Status", key: "paymentStatus" },
        { label: "Grand Total", key: "grandTotal" },
      ];
      break;

    case "purchases":
      data = await Purchase.find({}).lean();
      columns = [
        { label: "Purchase Number", key: "purchaseNumber" },
        { label: "Supplier", key: "supplierSnapshot.businessName" },
        { label: "Purchase Date", key: "purchaseDate" },
        { label: "Status", key: "purchaseStatus" },
        { label: "Grand Total", key: "grandTotal" },
      ];
      break;

    case "invoices":
      data = await Invoice.find({ isDeleted: { $ne: true } }).lean();
      columns = [
        { label: "Invoice Number", key: "invoiceNumber" },
        { label: "Customer", key: "customerSnapshot.businessName" },
        { label: "Invoice Date", key: "invoiceDate" },
        { label: "Due Date", key: "dueDate" },
        { label: "Payment Status", key: "paymentStatus" },
        { label: "Grand Total", key: "grandTotal" },
      ];
      break;

    case "payments":
      data = await Payment.find({ isDeleted: { $ne: true } })
        .populate("customerId", "businessName")
        .lean();
      columns = [
        { label: "Payment Number", key: "paymentNumber" },
        { label: "Receipt Number", key: "receiptNumber" },
        { label: "Customer", key: "customerId.businessName" },
        { label: "Payment Date", key: "paymentDate" },
        { label: "Method", key: "paymentMethod" },
        { label: "Amount Received", key: "amountReceived" },
        { label: "Status", key: "paymentStatus" },
      ];
      break;

    case "inventory":
      data = await Inventory.find({})
        .populate("productId", "productName productCode category")
        .lean();
      columns = [
        { label: "Inventory Code", key: "inventoryCode" },
        { label: "Product Name", key: "productId.productName" },
        { label: "Current Stock", key: "currentStock" },
        { label: "Available Stock", key: "availableStock" },
        { label: "Status", key: "stockStatus" },
      ];
      break;

    default:
      data = await Product.find({}).lean();
      columns = [{ label: "Product Code", key: "productCode" }, { label: "Product Name", key: "productName" }];
  }

  const filename = `${tableName}_Report_${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "xls"}`;
  if (user) {
    await auditLogService.logEvent({ module: tableName, action: `Export ${format.toUpperCase()}`, performedBy: user.email || user._id });
  }

  if (format === "csv") {
    return { filename, mimeType: "text/csv", content: csvService.exportCSV(data, columns) };
  } else {
    return { filename, mimeType: "application/vnd.ms-excel", content: excelService.exportExcel(data, columns, tableName) };
  }
};

/**
 * Unified Report Dataset Extractor.
 * Ensures PDF, Excel, and CSV exports consume the EXACT same filtered MongoDB dataset and totals.
 */
const getStructuredReportDataset = async (reportName = "sales-summary", query = {}) => {
  const nameKey = reportName.toLowerCase();
  let title = "Executive Business Report";
  let kpis = [];
  let columns = [];
  let rows = [];
  let totals = null;

  if (nameKey.includes("sales")) {
    title = "Sales Analytics & Revenue Report";
    const filter = { isDeleted: { $ne: true } };
    if (query.from || query.startDate) {
      filter.orderDate = { $gte: new Date(query.from || query.startDate) };
    }
    if (query.to || query.endDate) {
      filter.orderDate = filter.orderDate || {};
      filter.orderDate.$lte = new Date(query.to || query.endDate);
    }
    if (query.status) {
      filter.orderStatus = query.status;
    }

    const orders = await Order.find(filter).lean();
    const totalRev = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    kpis = [
      { label: "Total Orders", value: orders.length },
      { label: "Gross Revenue", value: `₹${totalRev.toFixed(2)}` },
    ];
    columns = [
      { label: "Order #", key: "orderNumber" },
      { label: "Customer", key: "customer" },
      { label: "Date", key: "date" },
      { label: "Status", key: "status" },
      { label: "Grand Total", key: "amount", align: "right" },
    ];
    rows = orders.map((o) => ({
      orderNumber: o.orderNumber,
      customer: o.customerSnapshot?.businessName || "Customer",
      date: new Date(o.orderDate || o.createdAt).toLocaleDateString("en-IN"),
      status: o.orderStatus || "Completed",
      amount: `₹${(o.grandTotal || 0).toFixed(2)}`,
    }));
    totals = { orderNumber: "TOTAL", amount: `₹${totalRev.toFixed(2)}` };
  } else if (nameKey.includes("purchase")) {
    title = "Purchase & Procurement Summary Report";
    const filter = {};
    if (query.status) filter.purchaseStatus = query.status;

    const purchases = await Purchase.find(filter).lean();
    const totalSpend = purchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);

    kpis = [
      { label: "Total Purchases", value: purchases.length },
      { label: "Total Spend", value: `₹${totalSpend.toFixed(2)}` },
    ];
    columns = [
      { label: "Purchase #", key: "purchaseNumber" },
      { label: "Supplier", key: "supplier" },
      { label: "Date", key: "date" },
      { label: "Status", key: "status" },
      { label: "Grand Total", key: "amount", align: "right" },
    ];
    rows = purchases.map((p) => ({
      purchaseNumber: p.purchaseNumber,
      supplier: p.supplierSnapshot?.businessName || "Supplier",
      date: new Date(p.purchaseDate || p.createdAt).toLocaleDateString("en-IN"),
      status: p.purchaseStatus || "Completed",
      amount: `₹${(p.grandTotal || 0).toFixed(2)}`,
    }));
    totals = { purchaseNumber: "TOTAL", amount: `₹${totalSpend.toFixed(2)}` };
  } else if (nameKey.includes("inventory")) {
    title = "Inventory Stock & Valuation Report";
    const filter = { status: { $ne: "Archived" } };
    if (query.category) filter.category = query.category;

    const products = await Product.find(filter).lean();
    const totalStock = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);

    kpis = [
      { label: "Total SKUs", value: products.length },
      { label: "Total Units in Stock", value: totalStock },
    ];
    columns = [
      { label: "Product Code", key: "code" },
      { label: "Product Name", key: "name" },
      { label: "Category", key: "category" },
      { label: "Stock", key: "stock", align: "right" },
      { label: "Selling Price", key: "price", align: "right" },
    ];
    rows = products.map((p) => ({
      code: p.productCode,
      name: p.productName,
      category: p.category || "General",
      stock: p.currentStock || 0,
      price: `₹${(p.sellingPrice || p.price || 0).toFixed(2)}`,
    }));
  } else {
    title = "ERP Business Analytics Summary";
    const [custCount, orderCount] = await Promise.all([Customer.countDocuments(), Order.countDocuments()]);
    kpis = [
      { label: "Active Customers", value: custCount },
      { label: "Total Orders", value: orderCount },
    ];
    columns = [
      { label: "Metric", key: "metric" },
      { label: "Value", key: "val", align: "right" },
    ];
    rows = [
      { metric: "Registered Customers", val: custCount },
      { metric: "Executed Orders", val: orderCount },
    ];
  }

  return { title, kpis, columns, rows, totals };
};

/**
 * Central Report PDF Generator built from live structured MongoDB data
 */
const generateReportPDF = async (reportName = "sales-summary", query = {}, user = null) => {
  const company = await getCompanyBranding();
  const dataset = await getStructuredReportDataset(reportName, query);
  const filename = `${reportName}_Report_${new Date().toISOString().split("T")[0]}.html`;

  if (user) {
    await auditLogService.logEvent({ module: "Reports", action: "Export PDF", performedBy: user.email || user._id, targetId: reportName });
  }

  return {
    filename,
    html: templateService.renderReportPDFHTML(dataset.title, reportName, dataset, query, company),
  };
};

/**
 * Central Report Export Generator for Excel & CSV (100% consistent dataset)
 */
const generateReportExport = async (reportName, format = "excel", query = {}, user = null) => {
  const dataset = await getStructuredReportDataset(reportName, query);
  const filename = `${reportName}_Report_${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "xls"}`;

  if (user) {
    await auditLogService.logEvent({ module: "Reports", action: `Export ${format.toUpperCase()}`, performedBy: user.email || user._id, targetId: reportName });
  }

  if (format === "csv") {
    return { filename, mimeType: "text/csv", content: csvService.exportCSV(dataset.rows, dataset.columns) };
  } else {
    return { filename, mimeType: "application/vnd.ms-excel", content: excelService.exportExcel(dataset.rows, dataset.columns, reportName) };
  }
};

module.exports = {
  generateInvoicePDF,
  generateInvoiceThermal,
  generatePurchaseOrderPDF,
  generatePaymentReceiptPDF,
  generatePaymentThermal,
  generateDeliveryChallanPDF,
  generateCustomerStatementPDF,
  generateSupplierStatementPDF,
  generateTableExport,
  generateReportExport,
  generateReportPDF,
};
