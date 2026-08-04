import React, { useEffect, useState } from "react";
import { useNotificationStore } from "../store/notificationStore";

/**
 * Centered notifications and templates manager page.
 * Displays tabs for dispatch queues and template configurations.
 * @component
 */
export default function Notifications() {
  const {
    notifications,
    templates,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    fetchNotifications,
    fetchTemplates,
    retryNotification,
    cancelNotification,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState("queue");
  const [selectedNtf, setSelectedNtf] = useState(null);

  // Preview helper values
  const [previewCustomer, setPreviewCustomer] = useState("Acme Produce");
  const [previewOrder, setPreviewOrder] = useState("ORD-9871");
  const [previewAmount, setPreviewAmount] = useState("15,450.00");
  const [previewInvoice, setPreviewInvoice] = useState("INV-0012");
  const [previewPayment, setPreviewPayment] = useState("PAY-8845");

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, [fetchNotifications, fetchTemplates]);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const handleSearchChange = (e) => {
    setFilters({ search: e.target.value });
  };

  const handleApply = async () => {
    await fetchNotifications();
  };

  const handleReset = async () => {
    resetFilters();
    setTimeout(async () => {
      await fetchNotifications();
    }, 100);
  };

  const handleRetry = async (id) => {
    try {
      await retryNotification(id);
      alert("Manual retry triggered successfully.");
    } catch (err) {
      alert(err.message || "Failed to retry message.");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this queued message?")) return;
    try {
      await cancelNotification(id);
      alert("Queued message cancelled.");
    } catch (err) {
      alert(err.message || "Failed to cancel message.");
    }
  };

  // Parses variables for a template preview mock
  const renderPreview = (content) => {
    if (!content) return "";
    return content
      .replace(/\{\{customer\}\}/g, previewCustomer)
      .replace(/\{\{order\}\}/g, previewOrder)
      .replace(/\{\{amount\}\}/g, `₹${previewAmount}`)
      .replace(/\{\{invoice\}\}/g, previewInvoice)
      .replace(/\{\{payment\}\}/g, previewPayment)
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString("en-IN"))
      .replace(/\{\{product\}\}/g, "Fresh Tomatoes")
      .replace(/\{\{supplier\}\}/g, "Green Farm Suppliers")
      .replace(/\{\{message\}\}/g, "Wholesale ledger balances notice.");
  };

  const tabs = [
    { id: "queue", name: "Message Logs & Queue" },
    { id: "templates", name: "Notification Templates" },
  ];

  if (loading && notifications.length === 0) return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading notifications logs...</div>;

  return (
    <section id="view-notifications" className="view-section">
      <div className="view-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div className="view-title">
          <h1>Notification & Communication Logs</h1>
          <p>Audit queued SMS messages, verify WhatsApp notification timelines, and customize communication templates</p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", marginBottom: "20px", gap: "10px" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`filter-tab ${activeTab === t.id ? "active" : ""}`}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === t.id ? "2px solid var(--primary-color)" : "none",
              color: activeTab === t.id ? "var(--primary-color)" : "#4b5563",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {error && <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px" }}>{error}</div>}

      {activeTab === "queue" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filters Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "12px 16px",
            }}
          >
            <input
              type="text"
              placeholder="Search recipient or text..."
              className="form-input"
              style={{ padding: "6px 12px", fontSize: "0.8rem", width: "180px" }}
              value={filters.search}
              onChange={handleSearchChange}
            />
            <select name="channel" className="form-select" style={{ padding: "6px 12px", fontSize: "0.8rem" }} value={filters.channel} onChange={handleSelectChange}>
              <option value="">-- All Channels --</option>
              {["WhatsApp", "SMS", "Email", "Push", "In App"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select name="status" className="form-select" style={{ padding: "6px 12px", fontSize: "0.8rem" }} value={filters.status} onChange={handleSelectChange}>
              <option value="">-- All Statuses --</option>
              {["Queued", "Processing", "Sent", "Delivered", "Read", "Failed", "Cancelled"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select name="module" className="form-select" style={{ padding: "6px 12px", fontSize: "0.8rem" }} value={filters.module} onChange={handleSelectChange}>
              <option value="">-- All Modules --</option>
              {["Order", "Invoice", "Payment", "Purchase", "Inventory", "Customer", "Supplier"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleApply}>Apply</button>
          </div>

          {/* Logs Queue table list */}
          <div className="table-responsive" style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Module</th>
                  <th>Channel</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>Message Body</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>No queued or sent logs found matching filters.</td></tr>
                ) : (
                  notifications.map((ntf) => (
                    <tr key={ntf._id}>
                      <td style={{ fontWeight: "600" }}>{ntf.notificationId}</td>
                      <td style={{ textTransform: "capitalize" }}>{ntf.module}</td>
                      <td>
                        <span className="badge badge-secondary">{ntf.channel}</span>
                      </td>
                      <td>{ntf.recipient}</td>
                      <td>
                        <span className={`badge badge-${ntf.status === "Delivered" || ntf.status === "Read" ? "success" : ntf.status === "Failed" ? "danger" : "warning"}`}>
                          {ntf.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ntf.message}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ marginRight: "6px" }} onClick={() => setSelectedNtf(ntf)}>Audit Timeline</button>
                        {ntf.status === "Failed" && (
                          <button type="button" className="btn btn-primary btn-sm" style={{ marginRight: "6px" }} onClick={() => handleRetry(ntf._id)}>Retry</button>
                        )}
                        {ntf.status === "Queued" && (
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleCancel(ntf._id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", alignItems: "start" }}>
          {/* Templates list */}
          <div className="table-responsive" style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Subject Header</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "700" }}>{t.type}</td>
                    <td>{t.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interactive variables parser preview widget */}
          <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontWeight: "700", fontSize: "0.95rem" }}>Template Preview Simulator</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label htmlFor="prev-cust" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "2px" }}>Customer</label>
                  <input id="prev-cust" type="text" className="form-input" style={{ width: "100%", padding: "4px 8px", fontSize: "0.8rem" }} value={previewCustomer} onChange={(e) => setPreviewCustomer(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="prev-amt" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "2px" }}>Amount</label>
                  <input id="prev-amt" type="text" className="form-input" style={{ width: "100%", padding: "4px 8px", fontSize: "0.8rem" }} value={previewAmount} onChange={(e) => setPreviewAmount(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                <div>
                  <label htmlFor="prev-ord" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "2px" }}>Order No</label>
                  <input id="prev-ord" type="text" className="form-input" style={{ width: "100%", padding: "4px 8px", fontSize: "0.8rem" }} value={previewOrder} onChange={(e) => setPreviewOrder(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="prev-inv" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "2px" }}>Invoice No</label>
                  <input id="prev-inv" type="text" className="form-input" style={{ width: "100%", padding: "4px 8px", fontSize: "0.8rem" }} value={previewInvoice} onChange={(e) => setPreviewInvoice(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="prev-pay" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "2px" }}>Payment No</label>
                  <input id="prev-pay" type="text" className="form-input" style={{ width: "100%", padding: "4px 8px", fontSize: "0.8rem" }} value={previewPayment} onChange={(e) => setPreviewPayment(e.target.value)} />
                </div>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "16px 0" }} />

            <h4 style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "8px" }}>Parsed Message Preview</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
              {templates.slice(0, 5).map((t, idx) => (
                <div key={idx} style={{ padding: "10px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.75rem", background: "#f9fafb" }}>
                  <div style={{ fontWeight: "700", marginBottom: "4px", color: "var(--primary-color)" }}>{t.type}</div>
                  <div style={{ color: "var(--text-main)", whiteSpace: "pre-wrap" }}>{renderPreview(t.content)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Timeline Overlay Modal */}
      {selectedNtf && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", width: "100%", maxWidth: "500px", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontWeight: "700" }}>Delivery Audit Timeline</h3>
              <button type="button" onClick={() => setSelectedNtf(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                <strong>Log ID:</strong> {selectedNtf.notificationId} &nbsp;|&nbsp; <strong>Recipient:</strong> {selectedNtf.recipient}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px", position: "relative", paddingLeft: "20px" }}>
                {/* Timeline vertical bar */}
                <div style={{ position: "absolute", left: "4px", top: "4px", bottom: "4px", width: "2px", background: "var(--border-color)" }} />
                
                {(selectedNtf.notificationTimeline || []).map((evt, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    {/* Timeline dot */}
                    <div style={{ position: "absolute", left: "-20px", top: "3px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary-color)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.8rem" }}>{evt.status}</span>
                      <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "#6b7280" }}>{evt.remarks}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedNtf(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
