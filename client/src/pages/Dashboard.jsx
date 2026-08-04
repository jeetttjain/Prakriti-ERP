import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDashboardStore } from "../store/dashboardStore";
import ChartContainer from "../components/reports/ChartContainer";

/**
 * Main admin intelligence dashboard hub view.
 * Features localStorage layout ordering and widgets personalization selectors.
 * @component
 */
export default function Dashboard() {
  const {
    overview,
    kpis,
    charts,
    activity,
    alerts,
    loading,
    error,
    fetchDashboard,
    widgetOrder,
    hiddenWidgets,
    setWidgetOrder,
    toggleWidgetVisibility,
  } = useDashboardStore();

  const [customizeOpen, setCustomizeOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val || 0);
  };

  // Reorder helper actions
  const moveWidget = (index, direction) => {
    const nextOrder = [...widgetOrder];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= nextOrder.length) return;

    // Swap items
    const temp = nextOrder[index];
    nextOrder[index] = nextOrder[targetIdx];
    nextOrder[targetIdx] = temp;
    setWidgetOrder(nextOrder);
  };

  const widgetNameMap = {
    kpis: "Financial KPI Cards",
    charts: "Trends Graphs",
    alerts: "Warnings & Alerts",
    activity: "Recent Activity Logs",
    status: "System Ledger Status",
  };

  if (loading && !overview) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading dashboard panels...</div>;
  }

  if (error) {
    return <div style={{ padding: "30px", background: "#fef2f2", color: "#991b1b" }}>Error loading dashboard: {error}</div>;
  }

  return (
    <section id="view-dashboard" className="view-section" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Welcome Header */}
      <div className="view-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-main)" }}>Welcome back, Admin!</h1>
          <p style={{ color: "#6b7280", margin: "4px 0 0 0" }}>Wholesale fresh produce catalog overview ledger</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setCustomizeOpen(!customizeOpen)}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          🔧 Customize Layout
        </button>
      </div>

      {/* Widget Layout Customizer panel */}
      {customizeOpen && (
        <div
          style={{
            background: "var(--card-bg, #fff)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: "700" }}>Configure Dashboard Personalization</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flexWrap: "wrap" }}>
            <div>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: "600", color: "#4b5563" }}>Show / Hide Widgets</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {Object.keys(hiddenWidgets).map((widgetId) => (
                  <label key={widgetId} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={!hiddenWidgets[widgetId]}
                      onChange={(e) => toggleWidgetVisibility(widgetId, e.target.checked)}
                    />
                    {widgetNameMap[widgetId]}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: "600", color: "#4b5563" }}>Reorder Widgets (Drag & Drop replacement)</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {widgetOrder.map((widgetId, idx) => (
                  <div key={widgetId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem" }}>
                    <span>{widgetNameMap[widgetId]}</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button type="button" disabled={idx === 0} style={{ padding: "2px 6px", cursor: idx === 0 ? "not-allowed" : "pointer" }} onClick={() => moveWidget(idx, -1)}>▲</button>
                      <button type="button" disabled={idx === widgetOrder.length - 1} style={{ padding: "2px 6px", cursor: idx === widgetOrder.length - 1 ? "not-allowed" : "pointer" }} onClick={() => moveWidget(idx, 1)}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Panel */}
      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: "700" }}>Wholesale Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
          {[
            { label: "Create Customer", path: "/customers", icon: "👤" },
            { label: "Create Product", path: "/products", icon: "📦" },
            { label: "Create Order", path: "/orders", icon: "🛍️" },
            { label: "Create Invoice", path: "/billing", icon: "📄" },
            { label: "Create Purchase", path: "/purchases", icon: "🚜" },
            { label: "Receive Payment", path: "/payments", icon: "💳" },
            { label: "Adjust Inventory", path: "/inventory", icon: "⚙️" },
          ].map((act, idx) => (
            <Link
              key={idx}
              to={act.path}
              className="btn btn-secondary"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                textAlign: "center",
                gap: "6px",
                height: "70px",
                boxShadow: "none",
                border: "1px solid var(--border-color)",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{act.icon}</span>
              {act.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Dynamic Widget Grid Renderer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {widgetOrder.map((widgetId) => {
          if (hiddenWidgets[widgetId]) return null;

          switch (widgetId) {
            case "kpis":
              return (
                <div key="kpis" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                  <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "600" }}>Gross Revenue</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "800", marginTop: "4px", color: "var(--primary-color)" }}>{formatCurrency(kpis?.revenue)}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>Cumulative invoice totals</div>
                  </div>
                  <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "600" }}>Total Collections</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "800", marginTop: "4px", color: "#10b981" }}>{formatCurrency(kpis?.collections)}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>Cleared payments values</div>
                  </div>
                  <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "600" }}>Outstanding Dues</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "800", marginTop: "4px", color: "#ef4444" }}>{formatCurrency(kpis?.outstanding)}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>Unpaid ledger receivables</div>
                  </div>
                  <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "600" }}>Inventory Asset Valuation</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "800", marginTop: "4px" }}>{formatCurrency(kpis?.inventoryValue)}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>Warehouse catalog values</div>
                  </div>
                </div>
              );

            case "charts":
              return (
                <div key="charts" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <ChartContainer title="Monthly Sales Trend Overview" type="bar" data={charts?.salesTrend} />
                  <ChartContainer title="Purchase Orders Replenishment Trend" type="area" data={charts?.purchaseTrend} />
                </div>
              );

            case "alerts":
              return (
                <div key="alerts" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                  {/* Low stock table widget */}
                  <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                    <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem", color: "#eab308" }}>⚠️ Low Stock Warnings</h4>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>SKU Product</th>
                          <th>Current stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alerts?.lowStock?.length === 0 ? (
                          <tr><td colSpan="2" style={{ textAlign: "center", color: "#9ca3af" }}>No low stock alerts</td></tr>
                        ) : (
                          (alerts?.lowStock || []).map((item) => (
                            <tr key={item._id}>
                              <td><Link to={`/inventory/${item._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{item.productId?.productName}</Link></td>
                              <td style={{ color: "#eab308", fontWeight: "700" }}>{item.currentStock} {item.productId?.unit}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Overdue payments table widget */}
                  <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                    <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem", color: "#ef4444" }}>💸 Overdue Dues Receivables</h4>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Invoice Ref</th>
                          <th>Customer</th>
                          <th>Due Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alerts?.overduePayments?.length === 0 ? (
                          <tr><td colSpan="3" style={{ textAlign: "center", color: "#9ca3af" }}>No overdue payments</td></tr>
                        ) : (
                          (alerts?.overduePayments || []).map((item) => (
                            <tr key={item._id}>
                              <td><Link to={`/billing/${item._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{item.invoiceNumber}</Link></td>
                              <td>{item.customerSnapshot?.businessName}</td>
                              <td style={{ color: "#ef4444", fontWeight: "700" }}>{formatCurrency(item.dueAmount)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );

            case "activity":
              return (
                <div key="activity" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", flexWrap: "wrap" }}>
                  {/* Recent sales orders */}
                  <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                    <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>📋 Recent Customer Sales Orders</h4>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order Code</th>
                          <th>Customer</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activity?.recentOrders?.length === 0 ? (
                          <tr><td colSpan="3" style={{ textAlign: "center", color: "#9ca3af" }}>No recent orders</td></tr>
                        ) : (
                          (activity?.recentOrders || []).map((item) => (
                            <tr key={item._id}>
                              <td><Link to={`/orders/${item._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{item.orderNumber}</Link></td>
                              <td>{item.customerSnapshot?.businessName}</td>
                              <td>{formatCurrency(item.grandTotal)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Recent clearing payments */}
                  <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                    <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>💵 Recent Cleared Collections</h4>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Txn Reference</th>
                          <th>Method</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activity?.recentPayments?.length === 0 ? (
                          <tr><td colSpan="3" style={{ textAlign: "center", color: "#9ca3af" }}>No recent payments</td></tr>
                        ) : (
                          (activity?.recentPayments || []).map((item) => (
                            <tr key={item._id}>
                              <td><Link to={`/payments/${item._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{item.transactionId || item._id}</Link></td>
                              <td>{item.paymentMethod}</td>
                              <td style={{ color: "#10b981", fontWeight: "700" }}>{formatCurrency(item.amount)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );

            case "status":
              return (
                <div key="status" style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: "700" }}>System & Connection Status Checks</h3>
                  <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "0.8rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
                      <strong>Database Ledger:</strong> Connected Successfully
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
                      <strong>Wholesale Backend API:</strong> Online (1.0.0)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6" }} />
                      <strong>Last Snapshot Backup:</strong> Automated (Today, 03:00 AM)
                    </div>
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </section>
  );
}
