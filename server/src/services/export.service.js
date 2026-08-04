const excelService = require("./excel.service");
const csvService = require("./csv.service");
const qrService = require("./qr.service");

/**
 * Non-blocking file stream helper.
 * Streams buffer or string payload with appropriate download/inline headers.
 * @param {object} res Express response object
 * @param {Buffer|string} content File content payload
 * @param {string} filename Output file name
 * @param {string} mimeType Content MIME type
 * @param {boolean} [inline=false] Whether to display inline or trigger attachment download
 */
const streamFile = (res, content, filename, mimeType, inline = false) => {
  const disposition = inline ? "inline" : "attachment";
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
  res.setHeader("Cache-Control", "no-cache");
  return res.status(200).send(content);
};

/**
 * PDF Export Helper.
 * Serves print-ready PDF/HTML document stream.
 * @param {string} htmlContent HTML document string
 * @param {string} filename Output filename
 * @param {object} res Express response object
 */
const exportPDF = (htmlContent, filename, res) => {
  return streamFile(res, htmlContent, filename, "text/html; charset=utf-8", true);
};

/**
 * QR Code Stream Helper.
 * Serves inline SVG QR Code vector.
 * @param {string} text Target text to encode
 * @param {object} res Express response object
 */
const exportQR = (text, res) => {
  const svg = qrService.generateQRCodeSVG(text);
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  return res.status(200).send(svg);
};

module.exports = {
  exportCSV: csvService.exportCSV,
  exportExcel: excelService.exportExcel,
  exportPDF,
  exportQR,
  streamFile,
};
