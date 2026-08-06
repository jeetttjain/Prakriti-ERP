import React, { useEffect, useState } from "react";
import * as sceService from "../../services/systemControlService";

export default function EnterpriseSystemControlCenter() {
  const [activeTab, setActiveTab] = useState("modules");
  const [modules, setModules] = useState([]);
  const [flags, setFlags] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modRes, flgRes, cfgRes, mntRes, snpRes] = await Promise.all([
        sceService.getModules(),
        sceService.getFlags(),
        sceService.getConfigs(),
        sceService.getMaintenance(),
        sceService.getSnapshots(),
      ]);

      setModules(modRes.data || modRes);
      setFlags(flgRes.data || flgRes);
      setConfigs(cfgRes.data || cfgRes);
      setMaintenance(mntRes.data || mntRes);
      setSnapshots(snpRes.data || snpRes);
    } catch (err) {
      console.error("Error loading system control telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleModule = async (moduleId, currentStatus) => {
    try {
      if (currentStatus === "Running") {
        await sceService.stopModule(moduleId, false);
      } else {
        await sceService.startModule(moduleId);
      }
      loadData();
    } catch (err) {
      if (window.confirm(`${err.message}\nDo you want to force shutdown?`)) {
        try {
          await sceService.stopModule(moduleId, true);
          loadData();
        } catch (fErr) {
          alert(`Force shutdown failed: ${fErr.message}`);
        }
      }
    }
  };

  const handleToggleFlag = async (key, currentVal) => {
    try {
      await sceService.setFlag(key, !currentVal);
      loadData();
    } catch (err) {
      alert(`Flag toggle failed: ${err.message}`);
    }
  };

  const handleTriggerEmergency = async (target) => {
    if (!window.confirm(`⚠️ WARNING: Execute Emergency Control Action [${target}]?`)) return;
    try {
      await sceService.triggerEmergency(target);
      alert(`Emergency action [${target}] executed successfully.`);
      loadData();
    } catch (err) {
      alert(`Emergency action failed: ${err.message}`);
    }
  };

  const handleCreateSnapshot = async () => {
    const desc = prompt("Enter snapshot description:", "System State Backup");
    if (!desc) return;
    try {
      await sceService.createSnapshot(desc);
      alert("System state snapshot captured successfully!");
      loadData();
    } catch (err) {
      alert(`Snapshot failed: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>Enterprise System Control Center (SCE)</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Runtime command center, DAG dependency orchestrator, feature flags, hot-reload configs, emergency kill switches, and snapshots
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleCreateSnapshot} className="btn btn-secondary" style={{ fontWeight: "700" }}>
            📸 Capture System Snapshot
          </button>
          <button onClick={loadData} className="btn btn-primary" style={{ fontWeight: "700" }}>
            🔄 Refresh System Control
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Running Modules</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#16a34a" }}>{modules.filter(m => m.status === "Running").length} / {modules.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Active Flags</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0284c7" }}>{flags.filter(f => f.isEnabled).length} / {flags.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Maintenance Windows</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: maintenance.length > 0 ? "#dc2626" : "#16a34a" }}>{maintenance.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>System Snapshots</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#8b5cf6" }}>{snapshots.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "modules", label: "🧩 Subsystem Modules & DAG Dependencies" },
          { id: "flags", label: "🚩 Feature Flags & Canary Rollout" },
          { id: "emergency", label: "🚨 Emergency Control & Recovery Playbooks" },
          { id: "snapshots", label: "📸 System State Snapshots" },
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

      {/* TAB: Subsystem Modules */}
      {activeTab === "modules" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Subsystem Module Orchestration</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Module Name</th>
                  <th>Group</th>
                  <th>Dependencies</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m._id || m.moduleId}>
                    <td style={{ fontWeight: "700" }}>{m.name} ({m.moduleId})</td>
                    <td><span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>{m.group}</span></td>
                    <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{(m.dependencies || []).join(", ") || "None"}</td>
                    <td><span style={{ background: m.status === "Running" ? "#dcfce7" : "#fee2e2", color: m.status === "Running" ? "#15803d" : "#b91c1c", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{m.status}</span></td>
                    <td>
                      <button onClick={() => handleToggleModule(m.moduleId, m.status)} className={`btn btn-sm ${m.status === "Running" ? "btn-danger" : "btn-success"}`} style={{ fontWeight: "700" }}>
                        {m.status === "Running" ? "⏹ Stop Module" : "▶ Start Module"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Feature Flags */}
      {activeTab === "flags" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Runtime Feature Flags & Canary Rollout Manager</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Key</th>
                  <th>Category</th>
                  <th>Rollout %</th>
                  <th>Status</th>
                  <th>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((f) => (
                  <tr key={f._id || f.key}>
                    <td style={{ fontWeight: "700" }}>{f.name}</td>
                    <td style={{ fontSize: "0.85rem", color: "#64748b" }}>{f.key}</td>
                    <td><span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>{f.category}</span></td>
                    <td style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0284c7" }}>{f.targeting?.canaryPercentage || 100}%</td>
                    <td><span style={{ background: f.isEnabled ? "#dcfce7" : "#fee2e2", color: f.isEnabled ? "#15803d" : "#b91c1c", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{f.isEnabled ? "ENABLED" : "DISABLED"}</span></td>
                    <td>
                      <button onClick={() => handleToggleFlag(f.key, f.isEnabled)} className={`btn btn-sm ${f.isEnabled ? "btn-secondary" : "btn-primary"}`} style={{ fontWeight: "700" }}>
                        {f.isEnabled ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Emergency Control */}
      {activeTab === "emergency" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800", color: "#dc2626" }}>🚨 Emergency Kill Switches & Zero-Latency Controls</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", border: "1px solid #fecaca", borderRadius: "10px", background: "#fef2f2" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#991b1b" }}>Emergency Automation Stop</h4>
              <p style={{ fontSize: "0.85rem", color: "#7f1d1d" }}>Immediately freezes background job processing and Event Bus dispatch.</p>
              <button onClick={() => handleTriggerEmergency("AUTOMATION_STOP")} className="btn btn-danger" style={{ fontWeight: "700", width: "100%" }}>
                🛑 Stop All Automation Queues
              </button>
            </div>

            <div style={{ padding: "16px", border: "1px solid #fecaca", borderRadius: "10px", background: "#fef2f2" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#991b1b" }}>Communication Kill Switch</h4>
              <p style={{ fontSize: "0.85rem", color: "#7f1d1d" }}>Immediately halts WhatsApp, Email, and SMS message dispatches.</p>
              <button onClick={() => handleTriggerEmergency("COMMUNICATION_STOP")} className="btn btn-danger" style={{ fontWeight: "700", width: "100%" }}>
                🛑 Freeze Communication Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
