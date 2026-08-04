import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useCustomerPortalStore } from "../store/customerPortalStore";
import { useCustomerCartStore } from "../store/customerCartStore";

const PRIMARY_NAV = [
  {
    to: ROUTES.CUSTOMER_DASHBOARD,
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: ROUTES.CUSTOMER_PRODUCTS,
    label: "Shop",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    to: ROUTES.CUSTOMER_CART,
    label: "Cart",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    badge: true,
  },
  {
    to: ROUTES.CUSTOMER_ORDERS,
    label: "Orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <rect x="2" y="7" width="20" height="15" rx="2" />
        <polyline points="16 2 12 6 8 2" />
      </svg>
    ),
  },
  {
    to: ROUTES.CUSTOMER_PROFILE,
    label: "More",
    isMore: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

const MORE_ITEMS = [
  { to: ROUTES.CUSTOMER_INVOICES, label: "Invoices", emoji: "🧾" },
  { to: ROUTES.CUSTOMER_PAYMENTS, label: "Payments", emoji: "💳" },
  { to: ROUTES.CUSTOMER_FAVORITES, label: "Favourites", emoji: "❤️" },
  { to: ROUTES.CUSTOMER_OFFERS, label: "Offers", emoji: "🎁" },
  { to: ROUTES.CUSTOMER_DRAFTS, label: "Drafts", emoji: "📝" },
  { to: ROUTES.CUSTOMER_SUPPORT, label: "Support", emoji: "💬" },
  { to: ROUTES.CUSTOMER_PROFILE, label: "Profile", emoji: "👤" },
  { to: ROUTES.CUSTOMER_NOTIFICATIONS, label: "Notifications", emoji: "🔔" },
];

const MORE_PATHS = MORE_ITEMS.map((i) => i.to);

/**
 * Full-screen mobile-first responsive layout for the Customer Self-Service Portal.
 * Provides a sticky top header, scrollable content area, a fixed bottom navigation bar,
 * and a slide-up "More" tray for secondary pages.
 * @component
 */
export default function CustomerLayout({ children, pageTitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { customer, logoutCustomer, notifications } = useCustomerPortalStore();
  const { items } = useCustomerCartStore();

  const [showMore, setShowMore] = useState(false);

  const unreadCount = notifications?.filter((n) => n.status !== "Read").length || 0;
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => {
    logoutCustomer();
    navigate(ROUTES.CUSTOMER_LOGIN);
  };

  const isActive = (path) => location.pathname === path;
  const isMoreActive = MORE_PATHS.some((p) => location.pathname === p);

  return (
    <div className="cp-shell">
      {/* ── Top Header ───────────────────────────── */}
      <header className="cp-header">
        <div className="cp-header-left">
          <span className="cp-logo">🌿 Prakriti</span>
          {pageTitle && <span className="cp-page-title">{pageTitle}</span>}
        </div>
        <div className="cp-header-right">
          <Link to={ROUTES.CUSTOMER_NOTIFICATIONS} className="cp-notif-btn" title="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="cp-notif-badge">{unreadCount}</span>}
          </Link>
          {customer && (
            <button className="cp-logout-btn" onClick={handleLogout} title="Logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* ── Scrollable Content ────────────────────── */}
      <main className="cp-content">{children}</main>

      {/* ── More Tray (slide-up) ─────────────────── */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowMore(false)}
            style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.35)" }}
          />
          <div style={{
            position: "fixed", bottom: 60, left: 0, right: 0, zIndex: 401,
            background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 8px",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.14)",
            animation: "slideUp 0.22s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827", margin: 0 }}>More Options</p>
              <button
                onClick={() => setShowMore(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#9ca3af" }}
              >✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, paddingBottom: 8 }}>
              {MORE_ITEMS.map((item) => (
                <button
                  key={item.to}
                  onClick={() => { setShowMore(false); navigate(item.to); }}
                  style={{
                    background: isActive(item.to) ? "#f0fdf4" : "#f8fafc",
                    border: isActive(item.to) ? "1.5px solid #15803d" : "1.5px solid #e2e8f0",
                    borderRadius: 12, padding: "10px 6px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: "1.4rem" }}>{item.emoji}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, color: isActive(item.to) ? "#15803d" : "#374151" }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            {/* Logout */}
            <button
              onClick={() => { setShowMore(false); handleLogout(); }}
              style={{ width: "100%", padding: "10px", background: "#fee2e2", border: "none", borderRadius: 10, color: "#dc2626", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", marginTop: 8 }}
            >
              Logout
            </button>
          </div>
        </>
      )}

      {/* ── Bottom Navigation Bar ─────────────────── */}
      {customer && (
        <nav className="cp-bottom-nav">
          {PRIMARY_NAV.map((item) => {
            if (item.isMore) {
              return (
                <button
                  key="more"
                  className={`cp-nav-item ${isMoreActive ? "active" : ""}`}
                  style={{ border: "none", background: "none", cursor: "pointer" }}
                  onClick={() => setShowMore((v) => !v)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`cp-nav-item ${isActive(item.to) ? "active" : ""}`}
                style={{ position: "relative" }}
              >
                {item.icon}
                {item.badge && cartCount > 0 && (
                  <span style={{
                    position: "absolute", top: -2, right: "calc(50% - 16px)",
                    background: "#f97316", color: "#fff", fontSize: "0.55rem",
                    fontWeight: 800, borderRadius: "999px", padding: "1px 5px", minWidth: 14, textAlign: "center",
                  }}>{cartCount}</span>
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
