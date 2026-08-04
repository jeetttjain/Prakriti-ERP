/**
 * Excel Export Service
 * Generates XML Spreadsheet 2003 format (compatible with MS Excel / LibreOffice / OpenOffice).
 * @module services/excel.service
 */

/**
 * Escapes special XML characters to prevent syntax corruption.
 * @param {any} val Value to escape
 * @returns {string} XML safe string
 */
const escapeXML = (val) => {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

/**
 * Resolves nested object values using dot-notation keys (e.g., 'customerSnapshot.businessName').
 * @param {object} obj Target data object
 * @param {string} path Property path
 * @returns {any} Resolved property value
 */
const getNestedValue = (obj, path) => {
  if (!obj || !path) return "";
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);
};

/**
 * Generates Excel XML document string for data collection.
 * @param {Array<object>} data Array of records
 * @param {Array<{ label: string, key: string }>} columns Column definitions
 * @param {string} [sheetName="ExportData"] Worksheet title
 * @returns {string} XML Spreadsheet string
 */
const exportExcel = (data = [], columns = [], sheetName = "ExportData") => {
  if (!Array.isArray(data)) data = [];

  let headers = [];
  if (columns && columns.length > 0) {
    headers = columns;
  } else if (data.length > 0) {
    headers = Object.keys(data[0]).map((key) => ({ label: key, key }));
  }

  const headerCells = headers
    .map(
      (h) => `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXML(h.label)}</Data></Cell>`
    )
    .join("");

  const dataRows = data
    .map((item) => {
      const cells = headers
        .map((h) => {
          const val = getNestedValue(item, h.key);
          const isNum = typeof val === "number";
          const type = isNum ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${escapeXML(val)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#16A34A" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXML(sheetName)}">
  <Table>
   <Row>${headerCells}</Row>
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;
};

module.exports = {
  exportExcel,
  escapeXML,
  getNestedValue,
};
