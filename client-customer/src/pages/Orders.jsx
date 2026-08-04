import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../services/customerService";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders().then((res) => setOrders(res.data || res.orders || res || [])).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Your Order History</h3>

      {orders.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>No previous orders found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {orders.map((o) => (
            <div key={o._id} style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "700" }}>{o.orderNumber}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(o.createdAt).toLocaleDateString("en-IN")} • ₹{o.grandTotal || 0}</div>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className="badge badge-success">{o.orderStatus || "Pending"}</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(`/orders/${o._id}`)}>View</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MobileBottomNav />
    </div>
  );
}
