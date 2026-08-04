import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCustomerPortalStore } from "../../store/customerPortalStore";
import { ROUTES } from "../../constants/routes";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

const orderBadge = (status) => {
  const map = {
    Draft: "cp-badge-neutral", Confirmed: "cp-badge-info", Packed: "cp-badge-warning",
    "Out For Delivery": "cp-badge-warning", Delivered: "cp-badge-success", Cancelled: "cp-badge-danger",
  };
  return map[status] || "cp-badge-neutral";
};

/**
 * Customer portal home / dashboard page.
 * @component
 */
export default function CustomerDashboard() {
  const { customer, dashboard, fetchDashboard, loading } = useCustomerPortalStore();

  useEffect(() => { fetchDashboard(); }, []);

  const d = dashboard || {};

  return (
    <>
      {/* Greeting */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0 }}>Welcome back,</p>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827", margin: "2px 0 0" }}>
          {customer?.businessName || "Customer"}
        </h2>
      </div>

      {/* Outstanding Banner */}
      {d.totalOutstanding > 0 && (
        <div className="cp-outstanding-banner">
          <span className="cp-outstanding-label">Outstanding Balance</span>
          <span className="cp-outstanding-amount">{fmt(d.totalOutstanding)}</span>
          <Link to={ROUTES.CUSTOMER_PAYMENTS} style={{ fontSize: "0.72rem", color: "#fca5a5", marginTop: 4 }}>
            View Outstanding Invoices →
          </Link>
        </div>
      )}

      {/* KPI Grid */}
      <div className="cp-kpi-grid">
        <div className="cp-kpi-card">
          <span className="cp-kpi-label">Pending Deliveries</span>
          <span className={`cp-kpi-value ${d.pendingDeliveries > 0 ? "warning" : "success"}`}>
            {loading ? "…" : d.pendingDeliveries ?? 0}
          </span>
        </div>
        <div className="cp-kpi-card">
          <span className="cp-kpi-label">Open Invoices</span>
          <span className={`cp-kpi-value ${d.outstandingInvoicesCount > 0 ? "danger" : "success"}`}>
            {loading ? "…" : d.outstandingInvoicesCount ?? 0}
          </span>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ marginBottom: 20 }}>
        <div className="cp-section-header">
          <p className="cp-section-title">Recent Orders</p>
          <Link to={ROUTES.CUSTOMER_ORDERS} className="cp-see-all">See all</Link>
        </div>
        {loading ? (
          <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading...</div>
        ) : d.recentOrders?.length ? (
          d.recentOrders.map((o) => (
            <Link to={`/portal/orders/${o._id}`} key={o._id} className="cp-card" style={{ display: "block", textDecoration: "none" }}>
              <div className="cp-card-row">
                <span className="cp-card-number">{o.orderNumber}</span>
                <span className={`cp-badge ${orderBadge(o.orderStatus)}`}>{o.orderStatus}</span>
              </div>
              <div className="cp-card-row" style={{ marginTop: 8 }}>
                <span className="cp-card-label">{fmtDate(o.orderDate)}</span>
                <span className="cp-card-value">{fmt(o.totalAmount)}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="cp-empty"><div className="cp-empty-icon">📦</div>No recent orders</div>
        )}
      </div>

      {/* Recent Invoices */}
      <div>
        <div className="cp-section-header">
          <p className="cp-section-title">Recent Invoices</p>
          <Link to={ROUTES.CUSTOMER_INVOICES} className="cp-see-all">See all</Link>
        </div>
        {loading ? (
          <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading...</div>
        ) : d.recentInvoices?.length ? (
          d.recentInvoices.map((inv) => (
            <Link to={`/portal/invoices/${inv._id}`} key={inv._id} className="cp-card" style={{ display: "block", textDecoration: "none" }}>
              <div className="cp-card-row">
                <span className="cp-card-number">{inv.invoiceNumber}</span>
                <span className={`cp-badge ${inv.invoiceStatus === "Paid" ? "cp-badge-success" : inv.invoiceStatus === "Cancelled" ? "cp-badge-danger" : "cp-badge-warning"}`}>
                  {inv.invoiceStatus}
                </span>
              </div>
              <div className="cp-card-row" style={{ marginTop: 8 }}>
                <span className="cp-card-label">Due {fmtDate(inv.dueDate)}</span>
                <span className="cp-card-value">{fmt(inv.grandTotal)}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="cp-empty"><div className="cp-empty-icon">🧾</div>No recent invoices</div>
        )}
      </div>
    </>
  );
}
