import React from "react";
import { useAuditStore } from "../../store/auditStore";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";

/**
 * Audit log entry table list row.
 */
const AuditRow = React.memo(({ log, onSelect }) => {
  const getBadgeClass = (type) => {
    switch (type) {
      case "CREATE": return "badge-success";
      case "UPDATE": return "badge-info";
      case "DELETE": return "badge-danger";
      case "SECURITY": return "badge-warning";
      case "EXPORT": return "badge-info";
      default: return "badge-secondary";
    }
  };

  return (
    <tr style={{ borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
      <td style={{ fontWeight: 700, color: "var(--text-main)" }}>{log.auditNumber}</td>
      <td>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>{log.userSnapshot?.name || "System"}</span>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{log.userSnapshot?.email || log.ipAddress}</span>
        </div>
      </td>
      <td>
        <span style={{ fontWeight: 600, color: "var(--primary-color)" }}>{log.module}</span>
      </td>
      <td>
        <span className={`badge ${getBadgeClass(log.actionType)}`}>{log.actionType}</span>
      </td>
      <td>{log.action}</td>
      <td>
        <span style={{ fontSize: "0.75rem", background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" }}>
          {log.ipAddress}
        </span>
      </td>
      <td>{new Date(log.createdAt).toLocaleString("en-IN")}</td>
      <td style={{ textAlign: "right" }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onSelect(log)}
          title="Inspect full audit record & data snapshots"
        >
          Inspect
        </button>
      </td>
    </tr>
  );
});

AuditRow.displayName = "AuditRow";

/**
 * Main Audit Table component displaying audit records with server-side pagination.
 * @component
 */
export default function AuditTable() {
  const { auditLogs, loading, error, currentPage, totalPages, setPage, setSelectedLog, fetchAuditLogs } = useAuditStore();

  if (loading) {
    return <TableSkeleton cols={8} rows={6} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchAuditLogs(currentPage)} />;
  }

  if (auditLogs.length === 0) {
    return <EmptyState message="No audit log records match the selected filter criteria." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="table-container" style={{ overflowX: "auto", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Audit #</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>User / Actor</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Module</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Type</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Action Summary</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>IP Address</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Timestamp</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <AuditRow key={log._id} log={log} onSelect={setSelectedLog} />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
