import React, { useState } from "react";
import { useAuditStore } from "../../store/auditStore";

/**
 * Slide-over drawer component for inspecting detailed Audit Log records and before/after JSON diffs.
 * @component
 */
export default function AuditDetailsDrawer() {
  const { selectedLog, setSelectedLog } = useAuditStore();
  const [copied, setCopied] = useState(false);

  if (!selectedLog) return null;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "520px",
        maxWidth: "90vw",
        height: "100vh",
        background: "var(--card-bg, #ffffff)",
        boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.15)",
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        padding: "24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>
            Audit Entry: {selectedLog.auditNumber}
          </h3>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            Recorded on {new Date(selectedLog.createdAt).toLocaleString("en-IN")}
          </span>
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={() => setSelectedLog(null)}
          style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6b7280" }}
        >
          ×
        </button>
      </div>

      {/* Metadata grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.85rem" }}>
        <div><strong>User:</strong> {selectedLog.userSnapshot?.name || "System"}</div>
        <div><strong>Role:</strong> {selectedLog.userSnapshot?.role || "System"}</div>
        <div><strong>Module:</strong> {selectedLog.module}</div>
        <div><strong>Action:</strong> {selectedLog.action}</div>
        <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
        <div><strong>Browser:</strong> {selectedLog.browser} ({selectedLog.operatingSystem})</div>
        <div><strong>Request Method:</strong> {selectedLog.requestMethod}</div>
        <div><strong>Response Status:</strong> {selectedLog.responseStatus}</div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 6px 0", fontSize: "0.85rem", textTransform: "uppercase", color: "#4b5563" }}>Description</h4>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-main)", background: "#f3f4f6", padding: "10px", borderRadius: "6px" }}>
          {selectedLog.description}
        </p>
      </div>

      {/* Before vs After Snapshots */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
        {selectedLog.beforeData && (
          <div>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "0.85rem", textTransform: "uppercase", color: "#dc2626" }}>Pre-Mutation Snapshot (Before)</h4>
            <pre style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "6px", fontSize: "0.75rem", overflowX: "auto" }}>
              {JSON.stringify(selectedLog.beforeData, null, 2)}
            </pre>
          </div>
        )}

        {selectedLog.afterData && (
          <div>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "0.85rem", textTransform: "uppercase", color: "#16a34a" }}>Post-Mutation Snapshot (After)</h4>
            <pre style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "6px", fontSize: "0.75rem", overflowX: "auto" }}>
              {JSON.stringify(selectedLog.afterData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ marginTop: "auto", display: "flex", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleCopyJSON}
          style={{ flex: 1 }}
        >
          {copied ? "✓ Copied JSON" : "📋 Copy Full JSON"}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setSelectedLog(null)}
          style={{ flex: 1 }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
