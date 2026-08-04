import { useEffect } from "react";
import { useCustomerPortalStore } from "../../store/customerPortalStore";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";

const typeIcon = (type) => {
  const m = {
    "Order Created": "📦", "Order Confirmed": "✅", "Order Delivered": "🎉",
    "Invoice Generated": "🧾", "Payment Received": "💰", "Outstanding Reminder": "⚠️",
    "System Alert": "🔔",
  };
  return m[type] || "🔔";
};

/**
 * Customer portal notifications page.
 * @component
 */
export default function MyNotifications() {
  const { notifications, fetchNotifications, markNotificationRead, loading } =
    useCustomerPortalStore();

  useEffect(() => { fetchNotifications(); }, []);

  const unread = notifications.filter((n) => n.status !== "Read");
  const read = notifications.filter((n) => n.status === "Read");

  const renderItem = (n) => (
    <div
      key={n._id}
      className="cp-card"
      style={{ borderLeft: n.status !== "Read" ? "3px solid #15803d" : "3px solid transparent", cursor: "pointer" }}
      onClick={() => n.status !== "Read" && markNotificationRead(n._id)}
    >
      <div className="cp-card-row">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.4rem" }}>{typeIcon(n.type)}</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "#111827", margin: 0 }}>{n.type}</p>
            <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: "2px 0 0" }}>{n.module}</p>
          </div>
        </div>
        {n.status !== "Read" && (
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#15803d", flexShrink: 0 }} />
        )}
      </div>
      <p style={{ fontSize: "0.78rem", color: "#374151", margin: "10px 0 6px", lineHeight: 1.5 }}>
        {n.message}
      </p>
      <p style={{ fontSize: "0.65rem", color: "#9ca3af", margin: 0 }}>{fmtDate(n.createdAt)}</p>
    </div>
  );

  return (
    <>
      <h1 className="cp-section-title" style={{ fontSize: "1rem", marginBottom: 14 }}>Notifications</h1>

      {loading ? (
        <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="cp-empty">
          <div className="cp-empty-icon">🔔</div>
          No notifications yet
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p className="cp-section-title">New ({unread.length})</p>
              {unread.map(renderItem)}
            </div>
          )}
          {read.length > 0 && (
            <div>
              <p className="cp-section-title" style={{ opacity: 0.6 }}>Earlier</p>
              {read.map(renderItem)}
            </div>
          )}
        </>
      )}
    </>
  );
}
