import React, { useEffect } from "react";
import { useAuditStore } from "../store/auditStore";
import AuditFilters from "../components/audit/AuditFilters";
import AuditTable from "../components/audit/AuditTable";
import AuditDetailsDrawer from "../components/audit/AuditDetailsDrawer";
import UserActivityCard from "../components/audit/UserActivityCard";

/**
 * Enterprise Audit Logs & Compliance Security Activity page.
 * @component
 */
export default function AuditLogs() {
  const { stats, fetchAuditLogs, fetchStats } = useAuditStore();

  useEffect(() => {
    fetchAuditLogs(1);
    fetchStats();
  }, [fetchAuditLogs, fetchStats]);

  return (
    <section id="view-audit-logs" className="view-section">
      <div className="view-header" style={{ marginBottom: "20px" }}>
        <div className="view-title">
          <h1>Audit Logs & Security Trail</h1>
          <p>System activity tracking, compliance auditing, and security operation logs</p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <UserActivityCard title="Total Activities" value={stats.totalActivities} icon="📊" color="#16a34a" />
        <UserActivityCard title="Today's Events" value={stats.todayActivities} icon="⚡" color="#2563eb" />
        <UserActivityCard title="Failed Logins" value={stats.failedLogins} icon="⚠️" color="#dc2626" />
        <UserActivityCard title="Document Exports" value={stats.totalExports} icon="📄" color="#9333ea" />
      </div>

      {/* Filter toolbar */}
      <AuditFilters />

      {/* Audit Data Table */}
      <AuditTable />

      {/* Detail Inspector Drawer */}
      <AuditDetailsDrawer />
    </section>
  );
}
