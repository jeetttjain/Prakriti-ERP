import React from "react";
import { useReportStore } from "../../store/reportStore";

/**
 * Filter panel capturing Date keywords and Custom dates.
 * @component
 */
export default function DateRangeFilter() {
  const { filters, setFilters, autoRefreshInterval, setAutoRefreshInterval } = useReportStore();

  const handleRangeChange = (e) => {
    const rangeType = e.target.value;
    setFilters({
      rangeType,
      // Clear custom values when switching away from custom
      startDate: rangeType === "Custom" ? filters.startDate : "",
      endDate: rangeType === "Custom" ? filters.endDate : "",
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        alignItems: "center",
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <label htmlFor="rep-date-preset" style={{ fontSize: "0.8rem", fontWeight: "600", color: "#4b5563" }}>Date Preset</label>
        <select
          id="rep-date-preset"
          className="form-select"
          style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "4px" }}
          value={filters.rangeType}
          onChange={handleRangeChange}
        >
          {["Today", "Yesterday", "Week", "Month", "Year", "Custom"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {filters.rangeType === "Custom" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <label htmlFor="rep-start-date" style={{ fontSize: "0.8rem", fontWeight: "600", color: "#4b5563" }}>From</label>
          <input
            id="rep-start-date"
            type="date"
            name="startDate"
            className="form-input"
            style={{ padding: "4px 8px", fontSize: "0.8rem", borderRadius: "4px" }}
            value={filters.startDate}
            onChange={handleDateChange}
          />
          <label htmlFor="rep-end-date" style={{ fontSize: "0.8rem", fontWeight: "600", color: "#4b5563" }}>To</label>
          <input
            id="rep-end-date"
            type="date"
            name="endDate"
            className="form-input"
            style={{ padding: "4px 8px", fontSize: "0.8rem", borderRadius: "4px" }}
            value={filters.endDate}
            onChange={handleDateChange}
          />
        </div>
      )}

      {/* Auto Refresh dropdown */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
        <label htmlFor="rep-auto-refresh" style={{ fontSize: "0.8rem", fontWeight: "600", color: "#4b5563" }}>Auto Refresh</label>
        <select
          id="rep-auto-refresh"
          className="form-select"
          style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "4px" }}
          value={autoRefreshInterval}
          onChange={(e) => setAutoRefreshInterval(e.target.value)}
        >
          <option value="Off">Off</option>
          <option value="30s">30 Seconds</option>
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
        </select>
      </div>
    </div>
  );
}
