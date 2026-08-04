const documentService = require("../services/document.service");
const exportService = require("../services/export.service");
const { errorResponse } = require("../services/response.service");

// GET /api/export/invoice/:id/pdf
exports.exportInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await documentService.generateInvoicePDF(id, req.user);
    return exportService.exportPDF(doc.html, doc.filename, res);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/invoice/:id/thermal
exports.exportInvoiceThermal = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await documentService.generateInvoiceThermal(id, req.user);
    return exportService.exportPDF(doc.html, doc.filename, res);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/purchase/:id/pdf
exports.exportPurchasePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await documentService.generatePurchaseOrderPDF(id, req.user);
    return exportService.exportPDF(doc.html, doc.filename, res);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/payment/:id/pdf
exports.exportPaymentPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await documentService.generatePaymentReceiptPDF(id, req.user);
    return exportService.exportPDF(doc.html, doc.filename, res);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/payment/:id/thermal
exports.exportPaymentThermal = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await documentService.generatePaymentThermal(id, req.user);
    return exportService.exportPDF(doc.html, doc.filename, res);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/challan/:id/pdf
exports.exportChallanPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await documentService.generateDeliveryChallanPDF(id, req.user);
    return exportService.exportPDF(doc.html, doc.filename, res);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/customer/:id/statement/pdf
exports.exportCustomerStatementPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await documentService.generateCustomerStatementPDF(id, req.user);
    return exportService.exportPDF(doc.html, doc.filename, res);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/supplier/:id/statement/pdf
exports.exportSupplierStatementPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await documentService.generateSupplierStatementPDF(id, req.user);
    return exportService.exportPDF(doc.html, doc.filename, res);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/table/:tableName/excel
exports.exportTableExcel = async (req, res) => {
  try {
    const { tableName } = req.params;
    const exportData = await documentService.generateTableExport(tableName, "excel", req.user);
    return exportService.streamFile(res, exportData.content, exportData.filename, exportData.mimeType);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/table/:tableName/csv
exports.exportTableCSV = async (req, res) => {
  try {
    const { tableName } = req.params;
    const exportData = await documentService.generateTableExport(tableName, "csv", req.user);
    return exportService.streamFile(res, exportData.content, exportData.filename, exportData.mimeType);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/report/:reportName/excel
exports.exportReportExcel = async (req, res) => {
  try {
    const { reportName } = req.params;
    const exportData = await documentService.generateReportExport(reportName, "excel", req.query, req.user);
    return exportService.streamFile(res, exportData.content, exportData.filename, exportData.mimeType);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/report/:reportName/csv
exports.exportReportCSV = async (req, res) => {
  try {
    const { reportName } = req.params;
    const exportData = await documentService.generateReportExport(reportName, "csv", req.query, req.user);
    return exportService.streamFile(res, exportData.content, exportData.filename, exportData.mimeType);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/report/:reportName/pdf
exports.exportReportPDF = async (req, res) => {
  try {
    const { reportName } = req.params;
    const doc = await documentService.generateReportPDF(reportName, req.query, req.user);
    return exportService.exportPDF(doc.html, doc.filename, res);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET /api/export/qr
exports.exportQRCode = async (req, res) => {
  try {
    const text = req.query.text || "Prakriti ERP Verified Document";
    return exportService.exportQR(text, res);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
