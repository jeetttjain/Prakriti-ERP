import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { getDashboard } from "../services/customerService";
import MobileBottomNav from "../components/MobileBottomNav";
import OfflineBanner from "../components/OfflineBanner";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data || res))
      .catch(() => setData({ outstandingAmount: 0, pendingOrdersCount: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingBottom: "80px" }}>
      <OfflineBanner />

      {/* Header */}
      <div style={{ background: "#16a34a", color: "#ffffff", padding: "20px 16px" }}>
        <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "700" }}>Partner Dashboard</h2>
        <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", opacity: 0.9 }}>Welcome back to Prakriti Fresh Produce</p>
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Outstanding</span>
            <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ef4444" }}>₹{data?.outstandingAmount || 0}</div>
          </div>
          <div style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Active Orders</span>
            <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#16a34a" }}>{data?.pendingOrdersCount || 0}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: "700" }}>Quick Actions</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button type="button" className="btn btn-primary" onClick={() => navigate(ROUTES.PRODUCTS)}>🛒 Order Products</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(ROUTES.ORDERS)}>📦 Order History</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(ROUTES.INVOICES)}>📄 Invoices</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(ROUTES.FAVORITES)}>⭐ Favorites</button>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
