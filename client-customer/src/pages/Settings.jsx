import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useCustomerStore } from "../store/customerStore";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Settings() {
  const navigate = useNavigate();
  const { logout, qrSession } = useCustomerStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.QR_LANDING);
  };

  const links = [
    { label: "📄 Invoices & Billing", path: ROUTES.INVOICES },
    { label: "💳 Payment Receipts", path: ROUTES.PAYMENTS },
    { label: "🎁 Offers & Promotions", path: ROUTES.OFFERS },
    { label: "⭐ Saved Favorites", path: ROUTES.FAVORITES },
    { label: "🔔 Notifications", path: ROUTES.NOTIFICATIONS },
    { label: "🎧 Support & Help", path: ROUTES.SUPPORT },
    { label: "👤 Account Profile", path: ROUTES.PROFILE },
  ];

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <div style={{ background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>{qrSession?.restaurant?.name || "Prakriti Fresh Produce"}</h3>
        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Branch: {qrSession?.restaurant?.branch || "Main Branch"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        {links.map((link) => (
          <button
            key={link.label}
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(link.path)}
            style={{ justifyContent: "flex-start", padding: "14px", fontSize: "0.95rem" }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-danger"
        style={{ width: "100%", padding: "14px" }}
        onClick={handleLogout}
      >
        🚪 Logout Session
      </button>

      <MobileBottomNav />
    </div>
  );
}
