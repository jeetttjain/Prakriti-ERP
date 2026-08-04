import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerCartStore } from "../../store/customerCartStore";
import { ROUTES } from "../../constants/routes";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const SLOTS = ["Morning", "Afternoon", "Evening"];

/**
 * Shopping cart page — item list with quantity controls, delivery picker, and proceed button.
 * @component
 */
export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, updateRemarks, deliveryDate, deliverySlot, notes, setDelivery, clearCart } =
    useCustomerCartStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="cp-success-wrap" style={{ paddingTop: 60 }}>
        <div className="cp-success-icon">🛒</div>
        <p className="cp-success-title">Your cart is empty</p>
        <p className="cp-success-msg">Browse products and add items to get started.</p>
        <button
          className="cp-add-btn"
          style={{ maxWidth: 200, margin: "20px auto 0", display: "block" }}
          onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h1 className="cp-section-title" style={{ fontSize: "1rem", margin: 0 }}>
          My Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>
        <button
          style={{ background: "none", border: "none", color: "#dc2626", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
          onClick={() => setShowClearConfirm(true)}
        >
          Clear All
        </button>
      </div>

      {showClearConfirm && (
        <div className="cp-alert-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.8rem" }}>Clear all items?</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="cp-btn-sm cp-btn-sm-danger" onClick={() => { clearCart(); setShowClearConfirm(false); }}>Yes, Clear</button>
            <button className="cp-btn-sm cp-btn-sm-outline" onClick={() => setShowClearConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Cart Items */}
      {items.map((item) => (
        <div key={item.productId} className="cp-cart-item">
          <div className="cp-cart-item-row" style={{ marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <p className="cp-cart-item-name">{item.productName}</p>
              <p className="cp-cart-item-meta">{item.category} · {fmt(item.sellingPrice)}/{item.unit}</p>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem", padding: "0 4px" }}
              title="Remove"
            >
              ✕
            </button>
          </div>
          <div className="cp-cart-item-row">
            <div className="cp-qty-row">
              <button className="cp-qty-btn" onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
              <div className="cp-qty-num">{item.quantity}</div>
              <button
                className="cp-qty-btn"
                onClick={() => updateQty(item.productId, item.quantity + 1)}
                disabled={item.availableStock && item.quantity >= item.availableStock}
              >+</button>
            </div>
            <span className="cp-cart-item-total">{fmt(item.sellingPrice * item.quantity)}</span>
          </div>
          {item.stockStatus === "Low Stock" && (
            <p style={{ fontSize: "0.65rem", color: "#d97706", margin: "6px 0 0" }}>⚠ Only {item.availableStock} {item.unit} available</p>
          )}
        </div>
      ))}

      {/* Subtotal */}
      <div className="cp-checkout-summary">
        <div className="cp-checkout-row">
          <span>Subtotal ({items.length} items)</span>
          <span className="cp-checkout-total">{fmt(subtotal)}</span>
        </div>
        <div className="cp-checkout-row" style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
          <span>Delivery charges</span>
          <span>Set by admin</span>
        </div>
        <div className="cp-checkout-row">
          <span style={{ fontWeight: 700 }}>Estimated Total</span>
          <span className="cp-checkout-grand">{fmt(subtotal)}</span>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="cp-card" style={{ marginBottom: 14 }}>
        <p className="cp-section-title" style={{ marginBottom: 12 }}>Delivery Details</p>

        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
          Preferred Delivery Date
        </label>
        <input
          type="date"
          className="cp-search-input"
          style={{ borderRadius: 10, paddingLeft: 14, marginBottom: 14 }}
          value={deliveryDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDelivery({ deliveryDate: e.target.value })}
        />

        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
          Preferred Slot
        </label>
        <div className="cp-slot-row" style={{ marginBottom: 14 }}>
          {SLOTS.map((s) => (
            <button
              key={s}
              className={`cp-slot-chip ${deliverySlot === s ? "active" : ""}`}
              onClick={() => setDelivery({ deliverySlot: s })}
            >
              {s === "Morning" ? "🌅" : s === "Afternoon" ? "☀️" : "🌙"} {s}
            </button>
          ))}
        </div>

        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
          Order Notes (optional)
        </label>
        <textarea
          className="cp-textarea"
          style={{ minHeight: 70 }}
          placeholder="Any special instructions…"
          value={notes}
          onChange={(e) => setDelivery({ notes: e.target.value })}
        />
      </div>

      <button
        className="cp-add-btn"
        style={{ padding: "14px", fontSize: "0.9rem", borderRadius: 12, marginBottom: 80 }}
        onClick={() => navigate(ROUTES.CUSTOMER_CHECKOUT)}
      >
        Review & Checkout →
      </button>
    </>
  );
}
