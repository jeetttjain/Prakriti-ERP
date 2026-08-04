import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useCustomerStore } from "../store/customerStore";
import { placeOrder } from "../services/customerService";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, qrSession, clearCart } = useCustomerStore();
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price || item.product.sellingPrice || 0) * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError(null);
    try {
      const orderPayload = {
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          unitPrice: item.product.price || item.product.sellingPrice || 0,
          remarks: item.remarks || "",
        })),
        notes: deliveryNotes,
        qrSessionId: qrSession?.qrSessionId,
      };

      const res = await placeOrder(orderPayload);
      clearCart();
      setOrderSuccess(res.data || res);
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", color: "#16a34a" }}>🎉</div>
        <h2>Order Confirmed!</h2>
        <p style={{ color: "#64748b" }}>Order #{orderSuccess.orderNumber || "ORD-SUCCESS"} has been placed successfully.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate(ROUTES.ORDERS)}>View Order Timeline</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Final Checkout Confirmation</h3>

      {error && <div style={{ color: "#dc2626", background: "#fef2f2", padding: "10px", borderRadius: "6px", marginBottom: "16px" }}>{error}</div>}

      <div style={{ background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
        <h4 style={{ margin: "0 0 8px 0" }}>Delivery Location & Notes</h4>
        <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#64748b" }}>
          Delivery for: <strong>{qrSession?.restaurant?.name || "Partner Restaurant"}</strong> ({qrSession?.restaurant?.branch || "Main Branch"})
        </p>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Special delivery instructions or preferred timing..."
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
        />
      </div>

      <div style={{ background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 8px 0" }}>Order Summary</h4>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: "700" }}>
          <span>Grand Total:</span>
          <span style={{ color: "#16a34a" }}>₹{subtotal.toFixed(2)}</span>
        </div>
      </div>

      <button type="button" className="btn btn-primary" style={{ width: "100%", padding: "14px", fontSize: "1rem" }} disabled={placing} onClick={handlePlaceOrder}>
        {placing ? "Confirming Order..." : "Confirm & Place Order"}
      </button>

      <MobileBottomNav />
    </div>
  );
}
