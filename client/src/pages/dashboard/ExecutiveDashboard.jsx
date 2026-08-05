import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboardStore } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";
import ChartContainer from "../../components/reports/ChartContainer";

export default function ExecutiveDashboard() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  
  const {
    overview,
    kpis,
    charts,
    activity,
    alerts,
    health,
    loading,
    error,
    lastUpdated,
    filters,
    setFilter,
    resetFilters,
    fetchDashboard,
    fetchPreferences,
    widgetOrder,
    hiddenWidgets,
    setWidgetOrder,
    toggleWidgetVisibility,
    clearCache,
  } = useDashboardStore();

  const [customizeOpen, setCustomizeOpen] = useState(false);

  useEffect(() => {
    fetchPreferences();
    fetchDashboard();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val || 0);
  };

  const moveWidget = (index, direction) => {
    const nextOrder = [...widgetOrder];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= nextOrder.length) return;

    const temp = nextOrder[index];
    nextOrder[index] = nextOrder[targetIdx];
    nextOrder[targetIdx] = temp;
    setWidgetOrder(nextOrder);
  };

  const widgetNameMap = {
    kpis: "1. Executive KPI Summary Cards",
    charts: "2. Revenue & Financial Trend Graphs",
    salesAnalytics: "3. Sales & Customer Distribution Analytics",
    inventoryAnalytics: "4. Warehouse Inventory & Stock Analytics",
    financeAnalytics: "5. Financial Ledger & Cash Flow",
    alerts: "6. Operational Alerts & Overdue Dues",
    activity: "7. Live Transaction & Audit Activity Stream",
    health: "8. Infrastructure & System Health Monitor",
  };

  const handleExport = (type, title) => {
    window.print();
  };

  return (
    <div className="executive-dashboard" style={{ maxWidth: "1400px", margin: "0 auto", padding: "16px" }}>
      {/* 1. Header & Global Filter Bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
          color: "white",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 10px 25px -5px rgba(22, 101, 52, 0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "1.85rem", fontWeight: "800", margin: 0 }}>Executive BI Console</h1>
              <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>
                Enterprise v1.0
              </span>
            </div>
            <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "0.9rem" }}>
              Welcome back, <strong>{currentUser?.name || "Administrator"}</strong> ({currentUser?.role || "Owner"}) — {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {lastUpdated && (
              <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                ⏱ Updated: {lastUpdated}
              </span>
            )}
            <button
              onClick={() => fetchDashboard()}
              className="btn"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              🔄 Refresh Data
            </button>
            <button
              onClick={() => clearCache()}
              className="btn"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              🧹 Clear Cache
            </button>
            <Link
              to="/business-intelligence"
              className="btn"
              style={{ background: "#22c55e", color: "white", fontWeight: "700" }}
            >
              ⚡ Open BI Console
            </Link>
            <button
              onClick={() => setCustomizeOpen(!customizeOpen)}
              className="btn"
              style={{ background: "#ffffff", color: "#166534", fontWeight: "700" }}
            >
              ⚙️ Customize Layout
            </button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>🎯 Global Filters:</span>
          
          <select
            value={filters.timeframe}
            onChange={(e) => setFilter("timeframe", e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "6px", border: "none", fontSize: "0.85rem", fontWeight: "600" }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="thisQuarter">This Quarter</option>
            <option value="thisYear">This Year</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilter("startDate", e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "6px", border: "none", fontSize: "0.85rem" }}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilter("endDate", e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "6px", border: "none", fontSize: "0.85rem" }}
            placeholder="End Date"
          />

          <button
            onClick={() => resetFilters()}
            style={{ background: "transparent", color: "white", border: "1px underline white", fontSize: "0.8rem", cursor: "pointer" }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Widget Customizer Modal / Panel */}
      {customizeOpen && (
        <div
          style={{
            background: "var(--card-bg, #fff)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ margin: "0 0 14px 0", fontSize: "1rem", fontWeight: "700" }}>Personalize Executive Widgets (Saved to Cloud DB)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: "600" }}>Visible Dashboard Sections</h4>
              {Object.keys(hiddenWidgets).map((id) => (
                <label key={id} style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!hiddenWidgets[id]}
                    onChange={(e) => toggleWidgetVisibility(id, e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  {widgetNameMap[id]}
                </label>
              ))}
            </div>
            <div>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: "600" }}>Reorder Sections</h4>
              {widgetOrder.map((id, idx) => (
                <div key={id} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "6px 12px", marginBottom: "6px", borderRadius: "6px", fontSize: "0.8rem" }}>
                  <span>{widgetNameMap[id]}</span>
                  <div>
                    <button disabled={idx === 0} onClick={() => moveWidget(idx, -1)} style={{ marginRight: "4px" }}>▲</button>
                    <button disabled={idx === widgetOrder.length - 1} onClick={() => moveWidget(idx, 1)}>▼</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div style={{ padding: "16px", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", marginBottom: "24px" }}>
          ⚠️ Error loading BI analytics data: {error}
        </div>
      )}

      {/* Render Dynamic Widgets */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {widgetOrder.map((widgetId) => {
          if (hiddenWidgets[widgetId]) return null;

          switch (widgetId) {
            // 2. Executive Animated KPI Summary Cards
            case "kpis":
              return (
                <div key="kpis" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                  <div
                    onClick={() => navigate("/billing")}
                    style={{
                      background: "var(--card-bg, #ffffff)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "14px",
                      padding: "20px",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Total Gross Revenue</span>
                      <span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>
                        +{overview?.growthPercentage || 0}% MoM
                      </span>
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#166534", marginTop: "8px" }}>
                      {loading ? "..." : formatCurrency(overview?.revenue)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "6px" }}>
                      Cumulative invoices • Click for Billing →
                    </div>
                  </div>

                  <div
                    onClick={() => navigate("/reports")}
                    style={{
                      background: "var(--card-bg, #ffffff)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "14px",
                      padding: "20px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Net Profit</span>
                      <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>
                        {overview?.netMargin}% Margin
                      </span>
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0284c7", marginTop: "8px" }}>
                      {loading ? "..." : formatCurrency(overview?.profit)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "6px" }}>
                      Gross sales minus expenses →
                    </div>
                  </div>

                  <div
                    onClick={() => navigate("/orders")}
                    style={{
                      background: "var(--card-bg, #ffffff)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "14px",
                      padding: "20px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Sales Orders</span>
                      <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>
                        {overview?.pendingOrders || 0} Pending
                      </span>
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#d97706", marginTop: "8px" }}>
                      {loading ? "..." : overview?.orders || 0}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "6px" }}>
                      Today: {overview?.todayOrders || 0} • Click to Manage →
                    </div>
                  </div>

                  <div
                    onClick={() => navigate("/inventory")}
                    style={{
                      background: "var(--card-bg, #ffffff)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "14px",
                      padding: "20px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Inventory Valuation</span>
                      <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>
                        {overview?.lowStockItems || 0} Low Stock
                      </span>
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#7c3aed", marginTop: "8px" }}>
                      {loading ? "..." : formatCurrency(overview?.inventoryValue)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "6px" }}>
                      Stock Valuation • Click for Stock →
                    </div>
                  </div>
                </div>
              );

            // 3. Revenue & Financial Trend Graphs
            case "charts":
              return (
                <div key="charts">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>📈 Revenue & Financial Trends</h3>
                    <button onClick={() => handleExport("pdf", "Financial Trends")} className="btn btn-secondary" style={{ fontSize: "0.8rem" }}>
                      📄 Export Chart Report
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <ChartContainer title="Monthly Sales Revenue Trend (INR)" type="bar" data={charts?.monthlySales} />
                    <ChartContainer title="Purchase Replenishment Expenses" type="area" data={charts?.purchaseTrend} />
                  </div>
                </div>
              );

            // 4. Sales & Customer Distribution Analytics
            case "salesAnalytics":
              return (
                <div key="salesAnalytics" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", background: "#fff", padding: "16px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "700" }}>🏆 Top 5 Selling Products</h4>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(charts?.topSellingProducts || []).map((prod, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: "600" }}>{prod.productName}</td>
                            <td>{prod.quantity}</td>
                            <td style={{ color: "#166534", fontWeight: "700" }}>{formatCurrency(prod.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", background: "#fff", padding: "16px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "700" }}>👥 Top Customers by Revenue</h4>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Customer Business</th>
                          <th>Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(charts?.topCustomers || []).map((cust, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: "600" }}>{cust.customerName}</td>
                            <td style={{ color: "#166534", fontWeight: "700" }}>{formatCurrency(cust.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );

            // 5. Warehouse Inventory Analytics
            case "inventoryAnalytics":
              return (
                <div key="inventoryAnalytics" style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "700", color: "#b45309" }}>⚠️ Inventory & Stock Exception Warnings</h4>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product SKU</th>
                          <th>Category</th>
                          <th>Current Stock</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(alerts?.lowStock || []).map((item) => (
                          <tr key={item._id}>
                            <td style={{ fontWeight: "600" }}>{item.productId?.productName}</td>
                            <td>{item.productId?.category || "Produce"}</td>
                            <td style={{ fontWeight: "700", color: "#b45309" }}>{item.currentStock} {item.productId?.unit}</td>
                            <td><span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>Low Stock</span></td>
                            <td><Link to="/purchases" style={{ color: "#0284c7", fontWeight: "600" }}>Order Supply →</Link></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );

            // 6. Financial Ledger & Cash Flow
            case "financeAnalytics":
              return (
                <div key="financeAnalytics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Received Cash Collections</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#166534", marginTop: "6px" }}>{formatCurrency(overview?.receivedPayments)}</div>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Pending Receivables</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#dc2626", marginTop: "6px" }}>{formatCurrency(overview?.pendingPayments)}</div>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Operating Cash Flow</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0284c7", marginTop: "6px" }}>{formatCurrency(overview?.cashFlow)}</div>
                  </div>
                </div>
              );

            // 7. Live Transaction & Audit Activity Stream
            case "activity":
              return (
                <div key="activity" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", background: "#fff", padding: "16px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "700" }}>📋 Recent Customer Orders</h4>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(activity?.latestOrders || []).map((ord) => (
                          <tr key={ord._id}>
                            <td><Link to={`/orders/${ord._id}`} style={{ fontWeight: "600", color: "#166534" }}>{ord.orderNumber}</Link></td>
                            <td>{ord.customerSnapshot?.businessName}</td>
                            <td style={{ fontWeight: "700" }}>{formatCurrency(ord.grandTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", background: "#fff", padding: "16px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "700" }}>🛡️ Audit Event Logs</h4>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Action</th>
                          <th>Module</th>
                          <th>User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(activity?.latestAuditEvents || []).map((audit) => (
                          <tr key={audit._id}>
                            <td style={{ fontWeight: "600" }}>{audit.action}</td>
                            <td>{audit.module}</td>
                            <td>{audit.performedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );

            // 8. Infrastructure & System Health Monitor
            case "health":
              return (
                <div key="health" style={{ background: "#1e293b", color: "#fff", borderRadius: "14px", padding: "20px" }}>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }}></span>
                    System Infrastructure & Health Monitor
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", fontSize: "0.85rem" }}>
                    <div>
                      <div style={{ opacity: 0.7 }}>Database Status</div>
                      <div style={{ fontWeight: "700", color: "#4ade80", fontSize: "1.1rem" }}>{health?.database?.status || "Connected"}</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>Latency: {health?.database?.latencyMs || 1} ms</div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.7 }}>API Server Uptime</div>
                      <div style={{ fontWeight: "700", color: "#60a5fa", fontSize: "1.1rem" }}>{health?.api?.uptimeSeconds || 0}s</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>Environment: {health?.api?.environment}</div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.7 }}>Background Scheduler</div>
                      <div style={{ fontWeight: "700", color: "#facc15", fontSize: "1.1rem" }}>{health?.scheduler?.active ? "Active" : "Paused"}</div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.7 }}>Server Memory (RSS)</div>
                      <div style={{ fontWeight: "700", color: "#c084fc", fontSize: "1.1rem" }}>{health?.system?.processRssMB || 0} MB</div>
                    </div>
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
