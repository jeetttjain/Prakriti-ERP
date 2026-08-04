import React, { useState } from "react";
import { useReportStore } from "../../store/reportStore";

/**
 * Custom presets panel enabling local storage views persistence.
 * @component
 */
export default function SavedReportFilters() {
  const { savedViews, saveCurrentView, loadSavedView, deleteSavedView, fetchReportData } = useReportStore();
  const [viewName, setViewName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!viewName.trim()) return;

    // Check if name is taken
    const exists = savedViews.some((v) => v.reportName.toLowerCase() === viewName.trim().toLowerCase());
    if (exists) {
      alert("A saved view with this name already exists.");
      return;
    }

    saveCurrentView(viewName.trim());
    setViewName("");
    setIsOpen(false);
  };

  const handleLoad = async (view) => {
    loadSavedView(view);
    // Trigger immediate reload
    setTimeout(async () => {
      await fetchReportData();
    }, 100);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", flex: "1 1 auto" }}>
        {savedViews.length === 0 ? (
          <span style={{ fontSize: "0.8rem", color: "#6b7280", padding: "4px 0" }}>No saved view presets. Save current filters configurations to reopen.</span>
        ) : (
          savedViews.map((view, idx) => (
            <div
              key={idx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f3f4f6",
                border: "1px solid var(--border-color)",
                borderRadius: "16px",
                padding: "4px 10px",
                fontSize: "0.8rem",
              }}
            >
              <button
                type="button"
                onClick={() => handleLoad(view)}
                style={{ background: "none", border: "none", color: "var(--text-main)", fontWeight: "600", cursor: "pointer", padding: 0 }}
                title={`Load saved view ${view.reportName}`}
              >
                {view.reportName}
              </button>
              <button
                type="button"
                onClick={() => deleteSavedView(view.reportName)}
                style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, fontSize: "0.9rem" }}
                title={`Delete view ${view.reportName}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ marginLeft: "auto", position: "relative" }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          Save Current View
        </button>

        {isOpen && (
          <form
            onSubmit={handleSave}
            style={{
              position: "absolute",
              right: 0,
              top: "34px",
              zIndex: 10,
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              width: "220px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <label htmlFor="save-view-name" style={{ fontSize: "0.75rem", fontWeight: "600" }}>Preset View Name</label>
            <input
              id="save-view-name"
              type="text"
              required
              className="form-input"
              style={{ padding: "6px", fontSize: "0.8rem", width: "100%", borderRadius: "4px", border: "1px solid var(--border-color)" }}
              placeholder="e.g. Sales Today"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
            />
            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary btn-sm" style={{ padding: "2px 6px", fontSize: "0.7rem" }} onClick={() => setIsOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: "2px 6px", fontSize: "0.7rem" }}>Save</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
