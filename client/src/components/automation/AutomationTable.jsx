import React from "react";
import { useAutomationStore } from "../../store/automationStore";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";

const RuleRow = React.memo(({ rule, onToggle, onRun, onClone, onSelect }) => {
  return (
    <tr style={{ borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
      <td style={{ fontWeight: 700, color: "var(--text-main)" }}>{rule.ruleNumber}</td>
      <td>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>{rule.name}</span>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>v{rule.version || 1} • {rule.description || "No description"}</span>
        </div>
      </td>
      <td><span style={{ fontWeight: 600, color: "var(--primary-color)" }}>{rule.module}</span></td>
      <td><span className="badge badge-info">{rule.trigger}</span></td>
      <td>
        <span className={`badge ${rule.isEnabled ? "badge-success" : "badge-secondary"}`}>
          {rule.isEnabled ? "ENABLED" : "DISABLED"}
        </span>
      </td>
      <td>{rule.executionCount || 0} runs</td>
      <td>{rule.lastRun ? new Date(rule.lastRun).toLocaleString("en-IN") : "Never"}</td>
      <td style={{ textAlign: "right" }}>
        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onToggle(rule._id)}>
            {rule.isEnabled ? "Disable" : "Enable"}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onRun(rule._id)} title="Run manual trigger">
            ▶ Run
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onClone(rule._id)} title="Clone rule">
            📋 Clone
          </button>
          <button type="button" className="btn btn-info btn-sm" onClick={() => onSelect(rule)} title="Inspect Rule">
            Inspect
          </button>
        </div>
      </td>
    </tr>
  );
});

RuleRow.displayName = "RuleRow";

/**
 * Automation Rule Table component with server-side pagination.
 * @component
 */
export default function AutomationTable() {
  const { rules, loading, error, currentPage, totalPages, setPage, toggleRuleState, runRuleManually, cloneRule, setSelectedRule, fetchRules } = useAutomationStore();

  if (loading) return <TableSkeleton cols={8} rows={6} />;
  if (error) return <ErrorState message={error} onRetry={() => fetchRules(currentPage)} />;
  if (rules.length === 0) return <EmptyState message="No automation rules found matching filter." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="table-container" style={{ overflowX: "auto", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Rule #</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Name & Version</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Module</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Trigger Event</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Status</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Executions</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Last Run</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <RuleRow
                key={rule._id}
                rule={rule}
                onToggle={toggleRuleState}
                onRun={runRuleManually}
                onClone={cloneRule}
                onSelect={setSelectedRule}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
