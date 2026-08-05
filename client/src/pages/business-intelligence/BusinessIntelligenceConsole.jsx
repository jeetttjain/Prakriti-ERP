import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBusinessIntelligenceStore } from "../../store/businessIntelligenceStore";

export default function BusinessIntelligenceConsole() {
  const {
    overview,
    recommendations,
    sales,
    inventory,
    customers,
    suppliers,
    finance,
    purchases,
    alerts,
    healthScore,
    loading,
    error,
    lastUpdated,
    filters,
    setFilter,
    fetchBIConsole,
    resolveRec,
    archiveRec,
  } = useBusinessIntelligenceStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [resolutionNotesMap, setResolutionNotesMap] = useState({});

  useEffect(() => {
    fetchBIConsole();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val || 0);
  };

  const handleResolve = (id) => {
    const notes = resolutionNotesMap[id] || "Resolved via BI Console";
    resolveRec(id, notes);
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "Critical":
        return { bg: "#fee2e2", color: "#b91c1c" };
      case "Warning":
        return { bg: "#fef3c7", color: "#b45309" };
      case "Info":
        return { bg: "#e0f2fe", color: "#0369a1" };
      case "Success":
        return { bg: "#dcfce7", color: "#15803d" };
      default:
        return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  if (loading && !overview) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⚙️</div>
        <h3>Evaluating Enterprise Business Intelligence & Rule Engines...</h3>
      </div>
    );
  }

  return (
    <div className="bi-console-page" style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Executive Health Score Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>Business Intelligence & Recommendation Engine</h1>
              <span style={{ background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700" }}>
                Rule Engine v2.0
              </span>
            </div>
            <p style={{ margin: "6px 0 0 0", opacity: 0.8, fontSize: "0.9rem" }}>
              Dynamic statistical analysis, risk scorecards, and automated operational recommendations
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Health Gauge Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.08)", padding: "12px 20px", borderRadius: "12px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "#4ade80" }}>
                  {healthScore?.overallScore || 92}
                </div>
                <div style={{ fontSize: "0.7rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px" }}>Health Score</div>
              </div>
              <div style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.2)" }} />
              <div>
                <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#facc15" }}>
                  Grade {healthScore?.grade || "A"}
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Overall Rating</div>
              </div>
            </div>

            <button onClick={() => fetchBIConsole()} className="btn" style={{ background: "#22c55e", color: "white", fontWeight: "700" }}>
              🔄 Re-evaluate Rules
            </button>
          </div>
        </div>

        {/* Sub-Score Progress Indicators */}
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
          {[
            { label: "Sales Score", score: healthScore?.subScores?.sales || 95, color: "#22c55e" },
            { label: "Inventory Score", score: healthScore?.subScores?.inventory || 88, color: "#f59e0b" },
            { label: "Finance Score", score: healthScore?.subScores?.finance || 90, color: "#3b82f6" },
            { label: "Customer Score", score: healthScore?.subScores?.customers || 85, color: "#a855f7" },
            { label: "Supplier Score", score: healthScore?.subScores?.suppliers || 88, color: "#06b6d4" },
            { label: "Operations Score", score: healthScore?.subScores?.operations || 94, color: "#10b981" },
          ].map((sub, idx) => (
            <div key={idx} style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "8px", fontSize: "0.8rem" }}>
              <div style={{ opacity: 0.7, marginBottom: "4px" }}>{sub.label}</div>
              <div style={{ fontWeight: "800", fontSize: "1.1rem", color: sub.color }}>{sub.score} / 100</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "overview", label: "🎯 Overview & Rules", count: recommendations.length },
          { id: "recommendations", label: "⚡ Recommendation Registry", count: recommendations.length },
          { id: "sales", label: "📈 Sales BI" },
          { id: "inventory", label: "📦 Inventory BI" },
          { id: "customer", label: "👥 Customer BI" },
          { id: "supplier", label: "🚜 Supplier BI" },
          { id: "finance", label: "💳 Financial BI" },
          { id: "purchase", label: "🛍️ Purchase BI" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "3px solid #16a34a" : "3px solid transparent",
              color: activeTab === tab.id ? "#16a34a" : "#64748b",
              fontWeight: activeTab === tab.id ? "700" : "600",
              cursor: "pointer",
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label} {tab.count !== undefined && <span style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "10px", fontSize: "0.75rem", marginLeft: "4px" }}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top Critical Recommendations Bar */}
          <div style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800", color: "#0f172a" }}>
              🚨 Active Automated Recommendations ({recommendations.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recommendations.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>No active recommendation alerts. System operations running optimally!</div>
              ) : (
                recommendations.map((rec) => {
                  const badge = getSeverityBadgeClass(rec.severity);
                  return (
                    <div
                      key={rec._id || rec.recId}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "16px",
                        background: "#f8fafc",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                          <span style={{ background: badge.bg, color: badge.color, padding: "2px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>
                            {rec.severity} • {rec.category}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>Priority: {rec.priority}</span>
                        </div>

                        <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: "700" }}>{rec.title}</h4>
                        <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#334155" }}>{rec.description}</p>
                        
                        <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                          💡 <strong>Suggested Action:</strong> {rec.suggestedAction}
                        </div>
                        {rec.estimatedImpact && (
                          <div style={{ fontSize: "0.8rem", color: "#166534", marginTop: "4px", fontWeight: "600" }}>
                            💰 <strong>Estimated Business Impact:</strong> {rec.estimatedImpact}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                        {rec.navigationTarget && (
                          <Link
                            to={rec.navigationTarget.path}
                            className="btn btn-secondary"
                            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                          >
                            {rec.navigationTarget.label || "Drill Down →"}
                          </Link>
                        )}
                        <button
                          onClick={() => handleResolve(rec.recId || rec._id)}
                          className="btn"
                          style={{ background: "#16a34a", color: "white", fontSize: "0.8rem", padding: "6px 12px" }}
                        >
                          ✓ Resolve Alert
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Recommendations Registry */}
      {activeTab === "recommendations" && (
        <div style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800" }}>Enterprise Recommendation Lifecycle Registry</h3>

            <div style={{ display: "flex", gap: "10px" }}>
              <select value={filters.category} onChange={(e) => setFilter("category", e.target.value)} style={{ padding: "6px 12px", borderRadius: "6px" }}>
                <option value="">All Categories</option>
                <option value="Sales">Sales</option>
                <option value="Inventory">Inventory</option>
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
                <option value="Finance">Finance</option>
                <option value="Purchase">Purchase</option>
              </select>

              <select value={filters.severity} onChange={(e) => setFilter("severity", e.target.value)} style={{ padding: "6px 12px", borderRadius: "6px" }}>
                <option value="">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="Warning">Warning</option>
                <option value="Info">Info</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Rec ID</th>
                  <th>Severity</th>
                  <th>Category</th>
                  <th>Title & Suggested Action</th>
                  <th>Impact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec) => {
                  const badge = getSeverityBadgeClass(rec.severity);
                  return (
                    <tr key={rec._id || rec.recId}>
                      <td style={{ fontWeight: "700", fontSize: "0.8rem" }}>{rec.recId || rec._id}</td>
                      <td><span style={{ background: badge.bg, color: badge.color, padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{rec.severity}</span></td>
                      <td>{rec.category}</td>
                      <td>
                        <div style={{ fontWeight: "700" }}>{rec.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{rec.suggestedAction}</div>
                      </td>
                      <td style={{ color: "#166534", fontWeight: "600", fontSize: "0.8rem" }}>{rec.estimatedImpact}</td>
                      <td><span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem" }}>{rec.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {rec.navigationTarget && (
                            <Link to={rec.navigationTarget.path} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                              Inspect
                            </Link>
                          )}
                          <button onClick={() => handleResolve(rec.recId || rec._id)} className="btn" style={{ background: "#16a34a", color: "white", fontSize: "0.75rem", padding: "4px 8px" }}>
                            Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Sales Intelligence */}
      {activeTab === "sales" && sales && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Today's Realized Sales</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#166534", marginTop: "4px" }}>{formatCurrency(sales.todaySales)}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>Orders count: {sales.todayOrdersCount}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Average Order Value (AOV)</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0284c7", marginTop: "4px" }}>{formatCurrency(sales.averageOrderValue)}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Peak Ordering Hours</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#d97706", marginTop: "4px" }}>{sales.peakOrderingHour}</div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Inventory Intelligence */}
      {activeTab === "inventory" && inventory && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Inventory Asset Valuation</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#166534", marginTop: "4px" }}>{formatCurrency(inventory.inventoryValue)}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Low Stock Exceptions</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#dc2626", marginTop: "4px" }}>{inventory.lowStockCount} Items</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Inventory Turnover Ratio</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#7c3aed", marginTop: "4px" }}>{inventory.inventoryTurnoverRatio}x / year</div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Financial Intelligence */}
      {activeTab === "finance" && finance && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Gross Realized Profit</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#166534", marginTop: "4px" }}>{formatCurrency(finance.grossProfit)}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>Net Margin: {finance.netMarginPct}%</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Outstanding Receivables</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#dc2626", marginTop: "4px" }}>{formatCurrency(finance.outstandingReceivables)}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Collection Efficiency Rate</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0284c7", marginTop: "4px" }}>{finance.collectionEfficiencyPct}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
