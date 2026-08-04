import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCustomerPortalStore } from "../../store/customerPortalStore";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_FILTERS = ["All", "Confirmed", "Packed", "Out For Delivery", "Delivered", "Cancelled"];

const badgeClass = (status) => {
  const m = {
    Draft: "cp-badge-neutral", Confirmed: "cp-badge-info", Packed: "cp-badge-warning",
    "Out For Delivery": "cp-badge-warning", Delivered: "cp-badge-success", Cancelled: "cp-badge-danger",
  };
  return m[status] || "cp-badge-neutral";
};

/**
 * Customer portal orders list page.
 * @component
 */
export default function MyOrders() {
  const { orders, ordersTotal, fetchOrders, loading } = useCustomerPortalStore();
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchOrders(filter !== "All" ? { status: filter } : {});
  }, [filter]);

  return (
    <>
      <h1 className="cp-section-title" style={{ fontSize: "1rem", marginBottom: 14 }}>My Orders</h1>

      <div className="cp-filter-row">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className={`cp-filter-chip ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading...</div>
      ) : orders.length === 0 ? (
        <div className="cp-empty">
          <div className="cp-empty-icon">📦</div>
          No orders found
        </div>
      ) : (
        <>
          <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 10 }}>
            {ordersTotal} order{ordersTotal !== 1 ? "s" : ""} found
          </p>
          {orders.map((o) => (
            <Link
              to={`/portal/orders/${o._id}`}
              key={o._id}
              className="cp-card"
              style={{ display: "block", textDecoration: "none" }}
            >
              <div className="cp-card-row">
                <span className="cp-card-number">{o.orderNumber}</span>
                <span className={`cp-badge ${badgeClass(o.orderStatus)}`}>{o.orderStatus}</span>
              </div>
              <div className="cp-card-row" style={{ marginTop: 8 }}>
                <span className="cp-card-label">{fmtDate(o.orderDate)}</span>
                <span className="cp-card-value">{fmt(o.totalAmount)}</span>
              </div>
              {o.branchSnapshot?.branchName && (
                <div style={{ marginTop: 6, fontSize: "0.7rem", color: "#9ca3af" }}>
                  📍 {o.branchSnapshot.branchName}
                </div>
              )}
              {o.expectedDeliveryDate && (
                <div style={{ marginTop: 4, fontSize: "0.7rem", color: "#6b7280" }}>
                  Expected: {fmtDate(o.expectedDeliveryDate)}
                </div>
              )}
            </Link>
          ))}
        </>
      )}
    </>
  );
}
