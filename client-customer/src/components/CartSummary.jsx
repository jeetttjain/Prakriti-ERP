import React from "react";
import { useCustomerStore } from "../store/customerStore";

/**
 * Cart Item list and price calculation summary component.
 * @component
 */
export default function CartSummary() {
  const { cart, updateCartQuantity, removeFromCart } = useCustomerStore();

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price || item.product.sellingPrice || 0) * item.quantity, 0);

  if (cart.length === 0) {
    return <p style={{ color: "#64748b", fontStyle: "italic", fontSize: "0.85rem" }}>Your cart is currently empty.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {cart.map((item) => (
        <div key={item.product._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
          <div>
            <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{item.product.name}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>₹{item.product.price || item.product.sellingPrice || 0} / {item.product.unit || "kg"}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}>-</button>
            <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{item.quantity}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}>+</button>
            <button type="button" style={{ background: "none", border: "none", color: "#ef4444", fontSize: "1.1rem", cursor: "pointer", marginLeft: "4px" }} onClick={() => removeFromCart(item.product._id)}>✕</button>
          </div>
        </div>
      ))}

      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: "700" }}>
        <span>Estimated Total:</span>
        <span style={{ color: "#16a34a" }}>₹{subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
