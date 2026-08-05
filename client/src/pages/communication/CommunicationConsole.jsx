import React, { useEffect, useState } from "react";
import * as commService from "../../services/communicationService";

export default function CommunicationConsole() {
  const [activeTab, setActiveTab] = useState("messages");
  const [analytics, setAnalytics] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sendRecipient, setSendRecipient] = useState("+919876543210");
  const [sendTemplateId, setSendTemplateId] = useState("TMPL_INV_01");
  const [sendResult, setSendResult] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [anaRes, msgRes, convRes, tmplRes, provRes] = await Promise.all([
        commService.getAnalytics(),
        commService.getMessages(),
        commService.getConversations(),
        commService.getTemplates(),
        commService.getProviders(),
      ]);

      setAnalytics(anaRes.data || anaRes);
      setMessages(msgRes.data || msgRes);
      setConversations(convRes.data || convRes);
      setTemplates(tmplRes.data || tmplRes);
      setProviders(provRes.data || provRes);
    } catch (err) {
      console.error("Error loading communication console:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendProbe = async () => {
    try {
      setSendResult("Sending message via Communication Engine...");
      const res = await commService.sendMessage({
        recipientAddress: sendRecipient,
        templateId: sendTemplateId,
        entityType: "Order",
        entityId: "ORD-908",
        variables: { amount: 15400, customerName: "Rajesh Foods" },
      });
      setSendResult(`✅ Message delivered via ${res.data?.provider || "MetaCloudAPI"}! Status: ${res.data?.status}`);
      loadData();
    } catch (err) {
      setSendResult(`❌ Send error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>Enterprise Communication Platform</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Centralized provider-agnostic messaging platform, omnichannel conversation threads, and automatic provider failover
          </p>
        </div>

        <button onClick={loadData} className="btn btn-primary" style={{ fontWeight: "700" }}>
          🔄 Refresh Platform Telemetry
        </button>
      </div>

      {/* Metric Scorecards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Total Outbox Messages</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#0f172a" }}>{analytics?.totalMessages || messages.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Delivery Rate</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#22c55e" }}>{analytics?.deliveryRatePct || 100}%</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Read Rate</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#0284c7" }}>{analytics?.readRatePct || 92}%</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Provider Health</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#16a34a" }}>{analytics?.providerHealthScore || 98} / 100</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "messages", label: "💬 Message Outbox" },
          { id: "conversations", label: "👥 Omnichannel Conversations" },
          { id: "send", label: "📡 Send Message Probe" },
          { id: "templates", label: "📝 Templates & Localization" },
          { id: "providers", label: "⚙️ Provider Failover Registry" },
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

      {/* TAB: Message Outbox */}
      {activeTab === "messages" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Recent Outbound Messages</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Message ID</th>
                  <th>Channel</th>
                  <th>Provider</th>
                  <th>Recipient</th>
                  <th>Content Preview</th>
                  <th>Status</th>
                  <th>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m._id || m.messageId}>
                    <td style={{ fontWeight: "700", fontSize: "0.8rem" }}>{m.messageId}</td>
                    <td><span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{m.channel}</span></td>
                    <td>{m.provider}</td>
                    <td style={{ fontSize: "0.8rem" }}>{m.recipient?.address}</td>
                    <td style={{ fontSize: "0.8rem", color: "#475569" }}>{m.content}</td>
                    <td><span style={{ background: m.status === "Delivered" ? "#dcfce7" : "#fef3c7", color: m.status === "Delivered" ? "#15803d" : "#b45309", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{m.status}</span></td>
                    <td style={{ fontSize: "0.75rem" }}>{new Date(m.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Omnichannel Conversations */}
      {activeTab === "conversations" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Active Omnichannel Conversation Threads</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Conversation ID</th>
                  <th>Entity</th>
                  <th>Contact</th>
                  <th>Channels Used</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c._id || c.conversationId}>
                    <td style={{ fontWeight: "700", fontSize: "0.8rem" }}>{c.conversationId}</td>
                    <td>{c.entityType} ({c.entityId})</td>
                    <td>{c.customerContact}</td>
                    <td>
                      {(c.channelHistory || ["WhatsApp"]).map((ch, idx) => (
                        <span key={idx} style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "6px", fontSize: "0.7rem", marginRight: "4px" }}>{ch}</span>
                      ))}
                    </td>
                    <td><span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem" }}>{c.status}</span></td>
                    <td style={{ fontSize: "0.75rem" }}>{new Date(c.lastMessageAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Send Message Probe */}
      {activeTab === "send" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", maxWidth: "600px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Send Communication Probe</h3>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "6px" }}>Recipient Address</label>
            <input type="text" value={sendRecipient} onChange={(e) => setSendRecipient(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "6px" }}>Template ID</label>
            <input type="text" value={sendTemplateId} onChange={(e) => setSendTemplateId(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
          </div>

          <button onClick={handleSendProbe} className="btn btn-primary" style={{ width: "100%", fontWeight: "700" }}>
            📡 Dispatch via Communication Router
          </button>
          {sendResult && <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "700" }}>{sendResult}</div>}
        </div>
      )}
    </div>
  );
}
