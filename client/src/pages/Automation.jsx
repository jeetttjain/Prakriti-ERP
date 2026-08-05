import React, { useState, useEffect } from "react";
import { useAutomationStore } from "../store/automationStore";
import api from "../services/api";

export default function Automation() {
  const { fetchRules, fetchExecutions, fetchStatsAndHealth } = useAutomationStore();
  const [activeTab, setActiveTab] = useState("events"); // "events" | "jobs" | "workflows" | "templates"
  const [metrics, setMetrics] = useState(null);
  const [eventsList, setEventsList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [workflowsList, setWorkflowsList] = useState([]);
  const [templatesList, setTemplatesList] = useState([]);

  const [newEventName, setNewEventName] = useState("ORDER_CREATED");
  const [newPayloadJson, setNewPayloadJson] = useState('{\n  "orderNumber": "ORD-9999",\n  "totalAmount": 12500\n}');
  const [publishMessage, setPublishMessage] = useState("");

  const loadCoreData = async () => {
    try {
      const [metricsRes, eventsRes, jobsRes, wfRes, tmplRes] = await Promise.all([
        api.get("/automation/metrics"),
        api.get("/automation/events"),
        api.get("/automation/jobs"),
        api.get("/automation/workflows"),
        api.get("/automation/templates"),
      ]);

      setMetrics(metricsRes.data.data);
      setEventsList(eventsRes.data.data || []);
      setJobsList(jobsRes.data.data || []);
      setWorkflowsList(wfRes.data.data || []);
      setTemplatesList(tmplRes.data.data || []);
    } catch (err) {
      console.error("Error loading automation core data:", err);
    }
  };

  useEffect(() => {
    fetchRules(1);
    fetchExecutions(1);
    fetchStatsAndHealth();
    loadCoreData();
  }, []);

  const handlePublishEvent = async () => {
    try {
      setPublishMessage("Publishing...");
      let parsed = {};
      try {
        parsed = JSON.parse(newPayloadJson);
      } catch {}

      await api.post("/automation/event", {
        eventName: newEventName,
        payload: parsed,
        metadata: { producerModule: "UI_CONSOLE" },
      });
      setPublishMessage("✅ Event published to Event Bus!");
      loadCoreData();
    } catch (err) {
      setPublishMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleReplayEvents = async () => {
    try {
      await api.post("/automation/events/replay", {});
      alert("Events replayed successfully!");
      loadCoreData();
    } catch (err) {
      alert(`Error replaying events: ${err.message}`);
    }
  };

  const handleJobAction = async (jobId, action) => {
    try {
      if (action === "pause") await api.patch(`/automation/job/${jobId}/pause`);
      else if (action === "resume") await api.patch(`/automation/job/${jobId}/resume`);
      else if (action === "retry") await api.patch(`/automation/job/${jobId}/retry`);
      else if (action === "cancel") await api.patch(`/automation/job/${jobId}/cancel`);
      loadCoreData();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <section id="view-automation" className="view-section" style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>Enterprise Automation Core & Event Bus</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Decoupled event-driven backbone, priority queues, versioned workflows, and live metrics telemetry
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleReplayEvents} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            🔁 Replay Event Bus
          </button>
          <button onClick={loadCoreData} className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
            🔄 Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Running Jobs</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0284c7" }}>{metrics?.runningJobs || 0}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Queued Jobs</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#d97706" }}>{metrics?.queuedJobs || 0}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Completed Jobs</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#166534" }}>{metrics?.completedJobs || 0}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Dead Letter Queue (DLQ)</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#dc2626" }}>{metrics?.deadQueue || 0}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Success Rate</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#22c55e" }}>{metrics?.successRate || 100}%</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Memory RSS</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#7c3aed" }}>{metrics?.memoryRssMb || 90} MB</div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "20px" }}>
        {[
          { id: "events", label: "⚡ Event Bus Log" },
          { id: "publisher", label: "📡 Event Publisher Probe" },
          { id: "jobs", label: "⚙️ Job Queue & DLQ" },
          { id: "workflows", label: "🔄 Workflows & Templates" },
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
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Event Bus Log */}
      {activeTab === "events" && (
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Live Event Bus History</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Event Name</th>
                  <th>Module</th>
                  <th>Correlation ID</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {eventsList.map((evt) => (
                  <tr key={evt._id || evt.eventId}>
                    <td style={{ fontWeight: "700", fontSize: "0.8rem" }}>{evt.eventId}</td>
                    <td><span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{evt.eventName}</span></td>
                    <td>{evt.producerModule}</td>
                    <td style={{ fontSize: "0.75rem", color: "#64748b" }}>{evt.correlationId}</td>
                    <td><span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem" }}>{evt.executionStatus}</span></td>
                    <td style={{ fontSize: "0.8rem" }}>{new Date(evt.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Event Publisher Probe */}
      {activeTab === "publisher" && (
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px", maxWidth: "600px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Manual Event Publisher Probe</h3>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "6px" }}>Event Name</label>
            <select value={newEventName} onChange={(e) => setNewEventName(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px" }}>
              <option value="ORDER_CREATED">ORDER_CREATED</option>
              <option value="INVOICE_GENERATED">INVOICE_GENERATED</option>
              <option value="PAYMENT_RECEIVED">PAYMENT_RECEIVED</option>
              <option value="LOW_STOCK">LOW_STOCK</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="BACKUP_COMPLETED">BACKUP_COMPLETED</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "6px" }}>Payload (JSON)</label>
            <textarea
              rows={5}
              value={newPayloadJson}
              onChange={(e) => setNewPayloadJson(e.target.value)}
              style={{ width: "100%", padding: "10px", fontFamily: "monospace", borderRadius: "6px" }}
            />
          </div>

          <button onClick={handlePublishEvent} className="btn btn-primary" style={{ width: "100%" }}>
            📡 Emit Event into Event Bus
          </button>
          {publishMessage && <div style={{ marginTop: "12px", fontSize: "0.85rem", fontWeight: "700" }}>{publishMessage}</div>}
        </div>
      )}

      {/* TAB: Job Queue */}
      {activeTab === "jobs" && (
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Priority Job Queue & Dead Letter Queue</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Job Name</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Retries</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobsList.map((job) => (
                  <tr key={job._id || job.jobId}>
                    <td style={{ fontWeight: "700", fontSize: "0.8rem" }}>{job.jobId}</td>
                    <td>{job.jobName}</td>
                    <td><span style={{ background: job.priority === "HIGH" ? "#fee2e2" : "#f1f5f9", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{job.priority}</span></td>
                    <td><span style={{ background: job.status === "COMPLETED" ? "#dcfce7" : "#fef3c7", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem" }}>{job.status}</span></td>
                    <td>{job.retryCount} / {job.maxRetries || 3}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => handleJobAction(job.jobId, "retry")} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>Retry</button>
                        <button onClick={() => handleJobAction(job.jobId, "cancel")} className="btn" style={{ background: "#dc2626", color: "white", fontSize: "0.75rem", padding: "4px 8px" }}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Workflows & Templates */}
      {activeTab === "workflows" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Pre-Packaged Workflow Templates</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {templatesList.map((tmpl) => (
                <div key={tmpl.templateId} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", background: "#f8fafc" }}>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "0.95rem" }}>{tmpl.name}</h4>
                  <p style={{ margin: "0 0 10px 0", fontSize: "0.8rem", color: "#64748b" }}>{tmpl.description}</p>
                  <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: "700" }}>Trigger: {tmpl.triggerEvent}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
