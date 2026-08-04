import React from "react";

/**
 * Enterprise Reports Export Toolbar Component.
 * Directly calls backend export endpoints (PDF, Excel, CSV) to trigger real document downloads.
 * Completely eliminates window.print() / screenshot dependencies.
 * @component
 * @param {Object} props
 * @param {string} [props.reportName="sales-summary"] Active report type identifier
 */
export default function ExportButtons({ reportName = "sales-summary" }) {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleExportPDF = () => {
    window.open(`${baseUrl}/export/report/${reportName}/pdf`, "_blank");
  };

  const handleExportExcel = () => {
    window.open(`${baseUrl}/export/report/${reportName}/excel`, "_blank");
  };

  const handleExportCSV = () => {
    window.open(`${baseUrl}/export/report/${reportName}/csv`, "_blank");
  };

  return (
    <div style={{ display: "flex", gap: "12px", marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "16px", flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleExportPDF}
        style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}
        title="Generate & download professional accounting PDF report"
      >
        <span style={{ marginRight: "6px" }}>📄</span> Export PDF
      </button>

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleExportExcel}
        style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
        title="Export dataset to Excel spreadsheet"
      >
        <span style={{ marginRight: "6px" }}>📊</span> Export Excel (.xls)
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleExportCSV}
        title="Export raw data values to RFC 4180 CSV file"
      >
        <span style={{ marginRight: "6px" }}>📋</span> Export CSV
      </button>
    </div>
  );
}
