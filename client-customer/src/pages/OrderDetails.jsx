import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../services/customerService";
import OrderTimeline from "../components/OrderTimeline";
import MobileBottomNav from "../components/MobileBottomNav";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrderById(id).then((res) => setOrder(res.data || res)).catch(() => {});
  }, [id]);

  if (!order) return <div style={{ padding: "20px" }}>Loading order tracking...</div>;

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>← Back to Orders</button>

      <h3 style={{ margin: "0 0 16px 0" }}>Tracking Order #{order.orderNumber}</h3>

      <OrderTimeline currentStatus={order.orderStatus} />

      <div style={{ background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "16px" }}>
        <h4 style={{ margin: "0 0 12px 0" }}>Order Items</h4>
        {order.items?.map((item, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", borderBottom: "1px solid #f1f5f9", padding: "6px 0" }}>
            <span>{item.productName || item.productId?.name || "Product"} x {item.quantity}</span>
            <span>₹{item.totalPrice || 0}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
          <span>Grand Total:</span>
          <span>₹{order.grandTotal}</span>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
