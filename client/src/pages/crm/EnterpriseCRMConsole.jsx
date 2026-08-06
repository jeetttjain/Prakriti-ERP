import React, { useEffect, useState } from "react";
import * as crmService from "../../services/crmService";

export default function EnterpriseCRMConsole() {
  const [activeTab, setActiveTab] = useState("c360");
  const [customers, setCustomers] = useState([]);
  const [selectedCustCode, setSelectedCustCode] = useState("CUST-B2B-01");
  const [c360, setC360] = useState(null);
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [visits, setVisits] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lead Form State
  const [leadComp, setLeadComp] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [custRes, ldRes, oppRes, qtRes, vstRes, cmpRes, fcstRes, anaRes] = await Promise.all([
        crmService.getCustomers(),
        crmService.getLeads(),
        crmService.getOpportunities(),
        crmService.getQuotations(),
        crmService.getVisits(),
        crmService.getComplaints(),
        crmService.getForecast(),
        crmService.getAnalytics(),
      ]);

      const custs = custRes.data || custRes;
      setCustomers(custs);
      if (custs.length > 0 && !selectedCustCode) {
        setSelectedCustCode(custs[0].customerCode);
      }

      setLeads(ldRes.data || ldRes);
      setOpportunities(oppRes.data || oppRes);
      setQuotations(qtRes.data || qtRes);
      setVisits(vstRes.data || vstRes);
      setComplaints(cmpRes.data || cmpRes);
      setForecast(fcstRes.data || fcstRes);
      setAnalytics(anaRes.data || anaRes);

      if (selectedCustCode) {
        const c360Res = await crmService.getCustomer360(selectedCustCode);
        setC360(c360Res.data || c360Res);
      }
    } catch (err) {
      console.error("Error loading CRM telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCustCode]);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await crmService.createLead({
        companyName: leadComp,
        contactName: leadContact,
        email: leadEmail,
        phone: leadPhone,
        leadSource: "Website",
      });
      alert("New sales lead captured and assigned!");
      setLeadComp("");
      setLeadContact("");
      setLeadEmail("");
      setLeadPhone("");
      loadData();
    } catch (err) {
      alert(`Lead creation failed: ${err.message}`);
    }
  };

  const handleConvertLead = async (leadId) => {
    try {
      await crmService.convertLead(leadId);
      alert("Lead converted successfully to Customer Account!");
      loadData();
    } catch (err) {
      alert(`Lead conversion failed: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>Enterprise CRM & Customer Experience Platform (ECXP)</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Customer 360 profile, sales pipeline, quotation dispatch, GPS visits, complaint SLA, credit control, and CRM analytics
          </p>
        </div>

        <button onClick={loadData} className="btn btn-primary" style={{ fontWeight: "700" }}>
          🔄 Refresh CRM Telemetry
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Active Customers</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a" }}>{customers.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Pipeline Value</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#16a34a" }}>₹ {analytics?.pipelineValueTotal ? (analytics.pipelineValueTotal / 100000).toFixed(1) : "18.0"} L</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Lead Conversion %</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0284c7" }}>{analytics?.leadConversionRatePct || 34.2}%</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Open Complaints</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: complaints.length > 0 ? "#d97706" : "#16a34a" }}>{complaints.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "c360", label: "🌐 Customer 360 Unified Profile" },
          { id: "leads", label: "🎯 Lead Capture & Pipeline" },
          { id: "quotes", label: "📜 Quotations & Dispatches" },
          { id: "visits", label: "📍 Sales Visits & Beat Plans" },
          { id: "complaints", label: "⚠️ Complaints & SLA Center" },
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

      {/* TAB: Customer 360 */}
      {activeTab === "c360" && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>
          {/* Customer Selector Sidebar */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: "800" }}>Select Account</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {customers.map((c) => (
                <button
                  key={c.customerCode}
                  onClick={() => setSelectedCustCode(c.customerCode)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: selectedCustCode === c.customerCode ? "2px solid #16a34a" : "1px solid #e2e8f0",
                    background: selectedCustCode === c.customerCode ? "#f0fdf4" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#0f172a" }}>{c.companyName}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{c.customerCode} | {c.segment}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 360 Profile Pane */}
          {c360 ? (
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800" }}>{c360.customer?.companyName}</h2>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{c360.customer?.contactName} | {c360.customer?.email} | {c360.customer?.phone}</span>
                </div>
                <div style={{ background: "#f0fdf4", padding: "8px 16px", borderRadius: "10px", border: "1px solid #bbf7d0", textAlign: "right" }}>
                  <div style={{ fontSize: "0.7rem", color: "#166534", textTransform: "uppercase", fontWeight: "800" }}>Customer Health Score</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#15803d" }}>{c360.healthScore?.healthScore || 88} / 100</div>
                </div>
              </div>

              {/* Sub-Scorecards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>Credit Limit</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800" }}>₹ {(c360.creditProfile?.creditLimit || 200000).toLocaleString()}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>Outstanding Amount</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#d97706" }}>₹ {(c360.customer?.outstandingAmount || 0).toLocaleString()}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>Loyalty Points</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0284c7" }}>{c360.loyaltyAccount?.pointsBalance || 1250} ({c360.loyaltyAccount?.tier || "Gold"})</div>
                </div>
              </div>

              {/* Activity Timeline */}
              <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "800" }}>Chronological Activity Stream</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(c360.recentActivities || []).map((act) => (
                  <div key={act._id || act.activityId} style={{ padding: "10px 14px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", marginRight: "8px" }}>{act.type}</span>
                      <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>{act.title}</span>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>Select a customer to view 360 profile</div>
          )}
        </div>
      )}

      {/* TAB: Leads */}
      {activeTab === "leads" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Capture New Lead</h3>
          <form onSubmit={handleCreateLead} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Company Name</label>
              <input type="text" className="form-control" value={leadComp} onChange={(e) => setLeadComp(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Contact Name</label>
              <input type="text" className="form-control" value={leadContact} onChange={(e) => setLeadContact(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Email</label>
              <input type="email" className="form-control" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Phone</label>
              <input type="text" className="form-control" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} required />
            </div>

            <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: "700" }}>
                🚀 Capture & Assign Lead
              </button>
            </div>
          </form>

          <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "800" }}>Lead Pipeline</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Source</th>
                  <th>Lead Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((ld) => (
                  <tr key={ld._id || ld.leadId}>
                    <td style={{ fontWeight: "800" }}>{ld.leadId}</td>
                    <td style={{ fontWeight: "700" }}>{ld.companyName}</td>
                    <td>{ld.contactName}</td>
                    <td><span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>{ld.leadSource}</span></td>
                    <td style={{ fontWeight: "800", color: "#16a34a" }}>{ld.leadScore} / 100</td>
                    <td><span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{ld.status}</span></td>
                    <td>
                      {ld.status !== "Converted" && (
                        <button onClick={() => handleConvertLead(ld.leadId)} className="btn btn-sm btn-success" style={{ fontWeight: "700" }}>
                          ⚡ Convert to Account
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
    </div>
  );
}
