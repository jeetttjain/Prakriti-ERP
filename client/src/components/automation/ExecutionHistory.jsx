import React from "react";
import { useAutomationStore } from "../../store/automationStore";

/**
 * Log table for Execution History & Dead Letter Queue (FAILED_PERMANENT).
 * @component
 */
export default function ExecutionHistory() {
  const { executions, setSelectedExecution } = useAutomationStore();

  if (!executions || executions.length === 0) {
    return <p style={{ color: "#6b7280", fontStyle: "italic", fontSize: "0.85rem", padding: "16px" }}>No execution history recorded yet.</p>;
  }

  const getBadgeClass = (status) => {
    switch (status) {
      case "SUCCESS": return "badge-success";
      case "FAILED": return "badge-warning";
      case "FAILED_PERMANENT": return "badge-danger";
      case "RUNNING": return "badge-info";
      default: return "badge-secondary";
    }
  };

  return (
    <div className="table-container" style={{ overflowX: "auto", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
      <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
            <th style={{ padding: "10px 14px", fontSize: "0.75rem", textTransform: "uppercase" }}>Exec #</th>
            <th style={{ padding: "10px 14px", fontSize: "0.75rem", textTransform: "uppercase" }}>Rule Name</th>
            <th style={{ padding: "10px 14px", fontSize: "0.75rem", textTransform: "uppercase" }}>Trigger</th>
            <th style={{ padding: "10px 14px", fontSize: "0.75rem", textTransform: "uppercase" }}>Status</th>
            <th style={{ padding: "10px 14px", fontSize: "0.75rem", textTransform: "uppercase" }}>Duration</th>
            <th style={{ padding: "10px 14px", fontSize: "0.75rem", textTransform: "uppercase" }}>Timestamp</th>
            <th style={{ padding: "10px 14px", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right" }}>Inspect</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((exec) => (
            <tr key={exec._id} style={{ borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
              <td style={{ fontWeight: 700 }}>{exec.executionNumber}</td>
              <td>{exec.ruleName} (v{exec.ruleVersion || 1})</td>
              <td><span className="badge badge-info">{exec.trigger}</span></td>
              <td><span className={`badge ${getBadgeClass(exec.status)}`}>{exec.status}</span></td>
              <td>{exec.duration || 0} ms</td>
              <td>{new Date(exec.executionTime || exec.createdAt).toLocaleString("en-IN")}</td>
              <td style={{ textAlign: "right" }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedExecution(exec)}>
                  Inspect
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
