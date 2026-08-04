import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useCustomerStore } from "../store/customerStore";

/**
 * Mobile bottom navigation bar for Customer Portal.
 * Items: Home, Shop, Cart, Orders, More
 * @component
 */
export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCustomerStore();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { label: "Home", path: ROUTES.DASHBOARD, icon: "🏠" },
    { label: "Shop", path: ROUTES.PRODUCTS, icon: "🥦" },
    { label: "Cart", path: ROUTES.CART, icon: "🛒", badge: cartCount },
    { label: "Orders", path: ROUTES.ORDERS, icon: "📦" },
    { label: "More", path: ROUTES.SETTINGS, icon: "☰" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        background: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        justify: "space-around",
        alignItems: "center",
        zIndex: 1000,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.path)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: isActive ? "#16a34a" : "#64748b",
              fontSize: "0.75rem",
              fontWeight: isActive ? "700" : "500",
              cursor: "pointer",
              position: "relative",
              padding: "4px 8px",
            }}
          >
            <span style={{ fontSize: "1.2rem", marginBottom: "2px" }}>{item.icon}</span>
            <span>{item.label}</span>

            {item.badge > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "12px",
                  background: "#ef4444",
                  color: "#ffffff",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  borderRadius: "10px",
                  padding: "1px 5px",
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
