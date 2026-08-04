const express = require("express");
const router = express.Router();
const {
  exportInvoicePDF,
  exportInvoiceThermal,
  exportPurchasePDF,
  exportPaymentPDF,
  exportPaymentThermal,
  exportChallanPDF,
  exportCustomerStatementPDF,
  exportSupplierStatementPDF,
  exportTableExcel,
  exportTableCSV,
  exportReportExcel,
  exportReportCSV,
  exportQRCode,
} = require("../controllers/export.controller");

const { authenticate } = require("../middlewares/auth.middleware");

// Optional auth wrapper to support both token authenticated requests & direct browser export downloads
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization || (req.cookies && req.cookies.token)) {
    return authenticate(req, res, next);
  }
  next();
};

// Document PDF & Thermal Exports
router.get("/invoice/:id/pdf", optionalAuth, exportInvoicePDF);
router.get("/invoice/:id/thermal", optionalAuth, exportInvoiceThermal);
router.get("/purchase/:id/pdf", optionalAuth, exportPurchasePDF);
router.get("/payment/:id/pdf", optionalAuth, exportPaymentPDF);
router.get("/payment/:id/thermal", optionalAuth, exportPaymentThermal);
router.get("/challan/:id/pdf", optionalAuth, exportChallanPDF);
router.get("/customer/:id/statement/pdf", optionalAuth, exportCustomerStatementPDF);
router.get("/supplier/:id/statement/pdf", optionalAuth, exportSupplierStatementPDF);

// Table Level Exports
router.get("/table/:tableName/excel", optionalAuth, exportTableExcel);
router.get("/table/:tableName/csv", optionalAuth, exportTableCSV);

// Report Exports
router.get("/report/:reportName/pdf", optionalAuth, exportReportPDF);
router.get("/report/:reportName/excel", optionalAuth, exportReportExcel);
router.get("/report/:reportName/csv", optionalAuth, exportReportCSV);

// QR Vector Stream
router.get("/qr", optionalAuth, exportQRCode);

module.exports = router;
