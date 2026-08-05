import React, { useEffect, useState } from "react";
import * as eopService from "../../services/observabilityService";

export default function EnterpriseOperationsCenter() {
  const [activeTab, setActiveTab] = useState("health");
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [traces, setTraces] = useState([]);
  const [diagReport, setDiagReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, mRes, lRes, aRes, tRes] = await Promise.all([
        eopService.getHealth(),
        eopService.getMetrics(),
        eopService.getLogs(),
        eopService.getAlerts(),
        eopService.getTraces(),
      ]);

      setHealth(hRes.data || hRes);
      setMetrics(mRes.data || mRes);
      setLogs(lRes.data || lRes);
      setAlerts(aRes.data || aRes);
      setTraces(tRes.data || tRes);
    } catch (err) {
      console.error("Error loading operations center telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunDiagnostics = async () => {
    try {
      setDiagReport("Running full system diagnostics suite...");
      const res = await eopService.runDiagnostics();
      setDiagReport(res.data || res);
    } catch (err) {
      alert(`Diagnostics failed: ${err.message}`);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await eopService.acknowledgeAlert(alertId);
      loadData();
    } catch (err) {
      alert(`Alert ack failed: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>Enterprise Operations Center (EOP)</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Unified monitoring, structured JSON logging, distributed tracing, alerting, and operational intelligence
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleRunDiagnostics} className="btn btn-secondary" style={{ fontWeight: "700" }}>
            🩺 Run Diagnostics Test Suite
          </button>
          <button onClick={loadData} className="btn btn-primary" style={{ fontWeight: "700" }}>
            🔄 Refresh Telemetry
          </button>
        </div>
      </div>

      {/* System Health Banner */}
      <div style={{ background: health?.status === "Healthy" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${health?.status === "Healthy" ? "#bbf7d0" : "#fecaca"}`, borderRadius: "12px", padding: "16px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "800", color: health?.status === "Healthy" ? "#166534" : "#991b1b" }}>SYSTEM OPERATIONAL HEALTH STATUS</span>
          <h2 style={{ margin: "4px 0 0 0", fontSize: "1.5rem", fontWeight: "800", color: health?.status === "Healthy" ? "#15803d" : "#dc2626" }}>
            {health?.status === "Healthy" ? "🟢 ALL SUBSYSTEMS HEALTHY & OPERATIONAL" : "🔴 SYSTEM ALERT / DEGRADED STATE"}
          </h2>
        </div>
        <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#475569" }}>
          <div>System Uptime: <strong>{Math.round(health?.uptimeSeconds || 0)}s</strong></div>
          <div>SLA Availability Target: <strong style={{ color: "#16a34a" }}>99.95%</strong></div>
        </div>
      </div>

      {/* Metric Scorecards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Memory Usage</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#0f172a" }}>{metrics?.memoryUsagePct || 42}%</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>MongoDB Latency</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#16a34a" }}>{metrics?.mongoLatencyMs || 12} ms</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Avg API Latency</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#0284c7" }}>{metrics?.apiAvgResponseTimeMs || 45} ms</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Active Alerts</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: alerts.filter(a => a.status === "Active").length > 0 ? "#dc2626" : "#16a34a" }}>{alerts.filter(a => a.status === "Active").length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "health", label: "🏥 Subsystem Health Inspector" },
          { id: "logs", label: "📄 Live Telemetry Logs" },
          { id: "alerts", label: "🚨 Alert Center" },
          { id: "traces", label: "🕸️ Distributed Tracing" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              color: activeTab === tab.id ? "#16a34a" : "#64748b",
              borderBottom: activeTab === tab.id ? "3px solid #16a34a" : "3px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Subsystem Health */}
      {activeTab === "health" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Subsystem Infrastructure Status</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Subsystem Name</th>
                  <th>Status</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {(health?.subsystems || []).map((sub, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "700" }}>{sub.name}</td>
                    <td><span style={{ background: sub.status === "Healthy" ? "#dcfce7" : "#fee2e2", color: sub.status === "Healthy" ? "#15803d" : "#b91c1c", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{sub.status}</span></td>
                    <td style={{ fontSize: "0.85rem" }}>{sub.latencyMs} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {diagReport && typeof diagReport === "object" && (
            <div style={{ marginTop: "24px", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
              <h4 style={{ margin: "0 0 10px 0" }}>Latest Diagnostics Report ({diagReport.reportId})</h4>
              <div>Overall Status: <strong>{diagReport.overallStatus}</strong></div>
              <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px", fontSize: "0.85rem" }}>
                {(diagReport.checks || []).map((c, i) => (
                  <li key={i}><strong>{c.subsystem}</strong>: {c.status} ({c.message})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB: Live Telemetry Logs */}
      {activeTab === "logs" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Structured Telemetry Logs (Sensitive Data Masked)</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Level</th>
                  <th>Module</th>
                  <th>Message</th>
                  <th>Correlation ID</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id || l.logId}>
                    <td style={{ fontWeight: "700", fontSize: "0.8rem" }}>{l.logId}</td>
                    <td><span style={{ background: l.level === "ERROR" ? "#fee2e2" : "#e0f2fe", color: l.level === "ERROR" ? "#b91c1c" : "#0369a1", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{l.level}</span></td>
                    <td style={{ fontSize: "0.8rem" }}>{l.module}</td>
                    <td style={{ fontSize: "0.8rem", color: "#334155" }}>{l.message}</td>
                    <td style={{ fontSize: "0.75rem", color: "#64748b" }}>{l.correlationId}</td>
                    <td style={{ fontSize: "0.75rem" }}>{new Date(l.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
