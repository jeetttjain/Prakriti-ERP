/**
 * CSV Export Service
 * Generates RFC 4180 compliant CSV streams.
 * @module services/csv.service
 */

const { getNestedValue } = require("./excel.service");

/**
 * Escapes CSV cells to handle double quotes, commas, and newlines.
 * @param {any} val Cell value
 * @returns {string} Escaped cell string
 */
const escapeCSVCell = (val) => {
  if (val === null || val === undefined) return '""';
  let str = typeof val === "object" ? JSON.stringify(val) : String(val);
  str = str.replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Generates RFC 4180 CSV text.
 * @param {Array<object>} data Records
 * @param {Array<{ label: string, key: string }>} columns Column headers
 * @returns {string} Formatted CSV text
 */
const exportCSV = (data = [], columns = []) => {
  if (!Array.isArray(data)) data = [];

  let headers = [];
  if (columns && columns.length > 0) {
    headers = columns;
  } else if (data.length > 0) {
    headers = Object.keys(data[0]).map((key) => ({ label: key, key }));
  }

  const headerRow = headers.map((h) => escapeCSVCell(h.label)).join(",");

  const dataRows = data.map((item) => {
    return headers
      .map((h) => {
        const val = getNestedValue(item, h.key);
        return escapeCSVCell(val);
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\r\n");
};

module.exports = {
  exportCSV,
  escapeCSVCell,
};
