import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerPortalStore } from "../../store/customerPortalStore";
import { ROUTES } from "../../constants/routes";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const ORDER_STEPS = ["Draft", "Confirmed", "Packed", "Out For Delivery", "Delivered"];

/**
 * Customer portal order detail page with delivery timeline.
 * @component
 */
export default function MyOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orderDetails, fetchOrderDetails, loading } = useCustomerPortalStore();

  useEffect(() => { if (id) fetchOrderDetails(id); }, [id]);

  const o = orderDetails;

  if (loading) {
    return <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading...</div>;
  }

  if (!o) {
    return <div className="cp-empty"><div className="cp-empty-icon">❌</div>Order not found.</div>;
  }

  const currentStep = ORDER_STEPS.indexOf(o.orderStatus);

  return (
    <>
      <button
        onClick={() => navigate(ROUTES.CUSTOMER_ORDERS)}
        style={{ background: "none", border: "none", color: "#15803d", cursor: "pointer", marginBottom: 12, fontWeight: 600, fontSize: "0.85rem" }}
      >
        ← Back to Orders
      </button>

      <div className="cp-card" style={{ marginBottom: 12 }}>
        <div className="cp-card-row">
          <span className="cp-card-number">{o.orderNumber}</span>
          <span className={`cp-badge ${o.orderStatus === "Delivered" ? "cp-badge-success" : o.orderStatus === "Cancelled" ? "cp-badge-danger" : "cp-badge-warning"}`}>
            {o.orderStatus}
          </span>
        </div>
        <div className="cp-card-row" style={{ marginTop: 8 }}>
          <span className="cp-card-label">Order Date</span>
          <span className="cp-card-value">{fmtDate(o.orderDate)}</span>
        </div>
        <div className="cp-card-row" style={{ marginTop: 4 }}>
          <span className="cp-card-label">Expected Delivery</span>
          <span className="cp-card-value">{fmtDate(o.expectedDeliveryDate)}</span>
        </div>
        {o.branchSnapshot?.branchName && (
          <div className="cp-card-row" style={{ marginTop: 4 }}>
            <span className="cp-card-label">Deliver To</span>
            <span className="cp-card-value">{o.branchSnapshot.branchName}</span>
          </div>
        )}
      </div>

      {/* Delivery Timeline */}
      {o.orderStatus !== "Cancelled" && (
        <div className="cp-card" style={{ marginBottom: 12 }}>
          <p className="cp-section-title" style={{ marginBottom: 12 }}>Delivery Progress</p>
          <div className="cp-timeline">
            {ORDER_STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              return (
                <div className="cp-timeline-item" key={step}>
                  <div className={`cp-timeline-dot ${isDone ? "done" : isActive ? "active" : ""}`} />
                  <p className={`cp-timeline-step ${isDone ? "done" : isActive ? "" : "pending"}`}>{step}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="cp-card">
        <p className="cp-section-title" style={{ marginBottom: 10 }}>Items</p>
        {o.items?.map((item, idx) => (
          <div key={idx} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 10, marginBottom: 10 }}>
            <div className="cp-card-row">
              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>
                {item.productName || item.productCode}
              </span>
              <span className="cp-card-value">{fmt(item.totalPrice)}</span>
            </div>
            <div className="cp-card-row" style={{ marginTop: 4 }}>
              <span className="cp-card-label">{item.quantity} {item.unit} × {fmt(item.unitPrice)}</span>
              {item.discount > 0 && (
                <span style={{ fontSize: "0.7rem", color: "#16a34a" }}>-{fmt(item.discount)} off</span>
              )}
            </div>
          </div>
        ))}

        <div className="cp-card-row" style={{ marginTop: 8 }}>
          <span className="cp-card-label">Subtotal</span>
          <span className="cp-card-value">{fmt(o.subTotal)}</span>
        </div>
        {o.discountAmount > 0 && (
          <div className="cp-card-row">
            <span className="cp-card-label">Discount</span>
            <span style={{ fontSize: "0.85rem", color: "#16a34a", fontWeight: 600 }}>- {fmt(o.discountAmount)}</span>
          </div>
        )}
        <div className="cp-card-row" style={{ marginTop: 6, borderTop: "1.5px solid #f1f5f9", paddingTop: 8 }}>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>Total</span>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#15803d" }}>{fmt(o.totalAmount)}</span>
        </div>
      </div>
    </>
  );
}
