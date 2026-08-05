import React, { useEffect, useState } from "react";
import * as identityService from "../../services/identityService";

export default function IdentityConsole() {
  const [activeTab, setActiveTab] = useState("sessions");
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [securityConfig, setSecurityConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newKeyName, setNewKeyName] = useState("ERP Partner Gateway Key");
  const [keyResult, setKeyResult] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [usrRes, sessRes, devRes, keyRes, secRes] = await Promise.all([
        identityService.getUsers(),
        identityService.getSessions(),
        identityService.getDevices(),
        identityService.getApiKeys(),
        identityService.getSecurityConfig(),
      ]);

      setUsers(usrRes.data || usrRes);
      setSessions(sessRes.data || sessRes);
      setDevices(devRes.data || devRes);
      setApiKeys(keyRes.data || keyRes);
      setSecurityConfig(secRes.data || secRes);
    } catch (err) {
      console.error("Error loading IAM console data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevokeSession = async (sessionId) => {
    try {
      await identityService.revokeSession(sessionId);
      alert("Session revoked successfully.");
      loadData();
    } catch (err) {
      alert(`Revoke failed: ${err.message}`);
    }
  };

  const handleTrustDevice = async (deviceId) => {
    try {
      await identityService.trustDevice(deviceId);
      loadData();
    } catch (err) {
      alert(`Trust update failed: ${err.message}`);
    }
  };

  const handleBlockDevice = async (deviceId) => {
    try {
      await identityService.blockDevice(deviceId);
      loadData();
    } catch (err) {
      alert(`Block update failed: ${err.message}`);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      setKeyResult("Generating HMAC-signed API Key...");
      const res = await identityService.createApiKey(newKeyName, ["READ_ONLY", "ORDERS_WRITE"]);
      setKeyResult(`✅ API Key Created! ID: ${res.data?.keyId} | Key: ${res.data?.rawKey} (Copy now, secret key is shown once!)`);
      loadData();
    } catch (err) {
      setKeyResult(`❌ API Key creation failed: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>Enterprise Identity & Access Platform (IAM)</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Single source of truth for authentication, token rotation, active sessions, device trust, ABAC policies, and API keys
          </p>
        </div>

        <button onClick={loadData} className="btn btn-primary" style={{ fontWeight: "700" }}>
          🔄 Refresh Security Telemetry
        </button>
      </div>

      {/* Security Scorecards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Active Users</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#0f172a" }}>{users.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Active Sessions</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#16a34a" }}>{sessions.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Registered Devices</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#0284c7" }}>{devices.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Active API Keys</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#7c3aed" }}>{apiKeys.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "sessions", label: "🔑 Active Session Manager" },
          { id: "devices", label: "📱 Device Trust Inspector" },
          { id: "apikeys", label: "🗝️ API Key Studio" },
          { id: "policies", label: "🛡️ Security Policy & ABAC" },
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

      {/* TAB: Active Sessions */}
      {activeTab === "sessions" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Active User Sessions</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>User Code</th>
                  <th>IP Address</th>
                  <th>Device Fingerprint</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s._id || s.sessionId}>
                    <td style={{ fontWeight: "700", fontSize: "0.8rem" }}>{s.sessionId}</td>
                    <td><span style={{ fontWeight: "700", color: "#16a34a" }}>{s.userCode}</span></td>
                    <td style={{ fontSize: "0.8rem" }}>{s.ipAddress}</td>
                    <td style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.deviceFingerprint}</td>
                    <td><span style={{ background: s.status === "Active" ? "#dcfce7" : "#fee2e2", color: s.status === "Active" ? "#15803d" : "#b91c1c", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{s.status}</span></td>
                    <td style={{ fontSize: "0.75rem" }}>{new Date(s.lastActivityAt || s.createdAt).toLocaleTimeString()}</td>
                    <td>
                      {s.status === "Active" && (
                        <button onClick={() => handleRevokeSession(s.sessionId)} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 8px", color: "#dc2626" }}>
                          Force Logout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Device Trust Inspector */}
      {activeTab === "devices" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Registered Device Inspector</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>User Code</th>
                  <th>Device Name</th>
                  <th>IP Address</th>
                  <th>Risk Score</th>
                  <th>Trust Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d._id || d.deviceId}>
                    <td style={{ fontWeight: "700", fontSize: "0.8rem" }}>{d.deviceId}</td>
                    <td>{d.userCode}</td>
                    <td>{d.deviceName}</td>
                    <td>{d.ipAddress}</td>
                    <td><span style={{ fontWeight: "800", color: d.riskScore > 50 ? "#dc2626" : "#16a34a" }}>{d.riskScore || 15} / 100</span></td>
                    <td><span style={{ background: d.isTrusted ? "#dcfce7" : d.isBlocked ? "#fee2e2" : "#f1f5f9", color: d.isTrusted ? "#15803d" : d.isBlocked ? "#b91c1c" : "#475569", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{d.isTrusted ? "Trusted" : d.isBlocked ? "Blocked" : "Untrusted"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => handleTrustDevice(d.deviceId)} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>Trust</button>
                        <button onClick={() => handleBlockDevice(d.deviceId)} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 8px", color: "#dc2626" }}>Block</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: API Key Studio */}
      {activeTab === "apikeys" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", maxWidth: "700px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Create API Key</h3>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "6px" }}>Key Identifier Name</label>
            <input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
          </div>

          <button onClick={handleCreateApiKey} className="btn btn-primary" style={{ width: "100%", fontWeight: "700" }}>
            🗝️ Issue HMAC-Signed API Key
          </button>

          {keyResult && <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "700", wordBreak: "break-all" }}>{keyResult}</div>}
        </div>
      )}
    </div>
  );
}
