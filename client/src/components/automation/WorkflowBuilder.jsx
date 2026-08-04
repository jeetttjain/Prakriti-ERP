import React from "react";
import { useAutomationStore } from "../../store/automationStore";

/**
 * Slide-over drawer component for inspecting Rule Workflows or Execution Output.
 * @component
 */
export default function WorkflowBuilder() {
  const { selectedRule, selectedExecution, setSelectedRule, setSelectedExecution } = useAutomationStore();

  const item = selectedRule || selectedExecution;
  if (!item) return null;

  const isRule = !!selectedRule;

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
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>
            {isRule ? `Rule: ${item.name}` : `Execution: ${item.executionNumber}`}
          </h3>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            {isRule ? `Rule #${item.ruleNumber} • Version v${item.version || 1}` : `Triggered by ${item.triggeredBy} • ${item.status}`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedRule(null);
            setSelectedExecution(null);
          }}
          style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6b7280" }}
        >
          ×
        </button>
      </div>

      {/* Metadata Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.85rem" }}>
        <div><strong>Module:</strong> {item.module || "Automation"}</div>
        <div><strong>Trigger:</strong> {item.trigger}</div>
        <div><strong>Interval:</strong> {item.scheduleInterval || "EVENT_DRIVEN"}</div>
        <div><strong>Status:</strong> {isRule ? (item.isEnabled ? "ENABLED" : "DISABLED") : item.status}</div>
      </div>

      {/* Action / Output Items */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "0.85rem", textTransform: "uppercase", color: "#4b5563" }}>
          {isRule ? "Configured Workflow Actions" : "Execution Action Outputs"}
        </h4>

        <pre style={{ background: "#f3f4f6", padding: "12px", borderRadius: "6px", fontSize: "0.75rem", overflowX: "auto" }}>
          {JSON.stringify(isRule ? item.actions : item.output, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setSelectedRule(null);
            setSelectedExecution(null);
          }}
          style={{ width: "100%" }}
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
}
