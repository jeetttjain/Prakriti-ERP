import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerCartStore } from "../../store/customerCartStore";
import { useCustomerOrderStore } from "../../store/customerOrderStore";
import { ROUTES } from "../../constants/routes";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not selected";

/**
 * Order confirmation page — shows full order summary before final submit.
 * @component
 */
export default function Checkout() {
  const navigate = useNavigate();
  const { items, deliveryDate, deliverySlot, notes, clearCart } = useCustomerCartStore();
  const { submitOrder, submitting, submitError, submitSuccess, clearSubmitState } = useCustomerOrderStore();

  const subtotal = items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);
  const [placed, setPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const handlePlaceOrder = async () => {
    const payload = {
      orderItems: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        remarks: i.remarks || "",
      })),
      expectedDeliveryDate: deliveryDate || null,
      deliverySlot: deliverySlot || "Morning",
      customerNotes: notes || "",
    };
    const order = await submitOrder(payload);
    if (order) {
      clearCart();
      setPlacedOrder(order);
      setPlaced(true);
    }
  };

  // Success screen
  if (placed && placedOrder) {
    return (
      <div className="cp-success-wrap">
        <div className="cp-success-icon">✅</div>
        <p className="cp-success-title">Order Placed!</p>
        <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "#15803d", margin: "8px 0 4px" }}>
          {placedOrder.orderNumber}
        </p>
        <p className="cp-success-msg">
          Your order has been submitted as a <strong>Draft</strong>.<br />
          Our team will confirm it shortly.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className="cp-btn-sm cp-btn-sm-primary"
            style={{ padding: "10px 20px" }}
            onClick={() => {
              clearSubmitState();
              navigate(ROUTES.CUSTOMER_ORDERS);
            }}
          >
            View My Orders
          </button>
          <button
            className="cp-btn-sm cp-btn-sm-outline"
            style={{ padding: "10px 20px" }}
            onClick={() => {
              clearSubmitState();
              navigate(ROUTES.CUSTOMER_PRODUCTS);
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    navigate(ROUTES.CUSTOMER_CART);
    return null;
  }

  return (
    <>
      <button
        onClick={() => navigate(ROUTES.CUSTOMER_CART)}
        style={{ background: "none", border: "none", color: "#15803d", cursor: "pointer", marginBottom: 12, fontWeight: 600, fontSize: "0.85rem" }}
      >
        ← Back to Cart
      </button>

      <h1 className="cp-section-title" style={{ fontSize: "1rem", marginBottom: 14 }}>Confirm Order</h1>

      {/* Delivery Details */}
      <div className="cp-card" style={{ marginBottom: 12 }}>
        <p className="cp-section-title" style={{ marginBottom: 10 }}>Delivery</p>
        <div className="cp-card-row">
          <span className="cp-card-label">Date</span>
          <span className="cp-card-value">{fmtDate(deliveryDate)}</span>
        </div>
        <div className="cp-card-row" style={{ marginTop: 6 }}>
          <span className="cp-card-label">Slot</span>
          <span className="cp-card-value">{deliverySlot}</span>
        </div>
        {notes && (
          <div style={{ marginTop: 8, fontSize: "0.75rem", color: "#6b7280" }}>
            📝 {notes}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="cp-card" style={{ marginBottom: 12 }}>
        <p className="cp-section-title" style={{ marginBottom: 10 }}>Items ({items.length})</p>
        {items.map((item) => (
          <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "#111827", margin: "0 0 2px" }}>{item.productName}</p>
              <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: 0 }}>{item.quantity} {item.unit} × {fmt(item.sellingPrice)}</p>
            </div>
            <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#15803d" }}>
              {fmt(item.sellingPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Price summary */}
      <div className="cp-checkout-summary">
        <div className="cp-checkout-row">
          <span>Items Subtotal</span>
          <span className="cp-checkout-total">{fmt(subtotal)}</span>
        </div>
        <div className="cp-checkout-row" style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
          <span>Delivery / Transport</span>
          <span>Added by admin</span>
        </div>
        <div className="cp-checkout-row">
          <span style={{ fontWeight: 700 }}>Estimated Total</span>
          <span className="cp-checkout-grand">{fmt(subtotal)}</span>
        </div>
      </div>

      {submitError && (
        <div className="cp-alert-info" style={{ background: "#fee2e2", color: "#dc2626", borderColor: "#fca5a5", marginBottom: 12 }}>
          ❌ {submitError}
        </div>
      )}

      <div style={{ marginBottom: 80, display: "flex", gap: 10, flexDirection: "column" }}>
        <button
          className="cp-add-btn"
          style={{ padding: "14px", fontSize: "0.9rem", borderRadius: 12 }}
          onClick={handlePlaceOrder}
          disabled={submitting}
        >
          {submitting ? "Placing Order…" : `Place Order — ${fmt(subtotal)}`}
        </button>
        <p style={{ textAlign: "center", fontSize: "0.68rem", color: "#9ca3af" }}>
          Order is saved as Draft. Admin will confirm and may adjust delivery charges.
        </p>
      </div>
    </>
  );
}
