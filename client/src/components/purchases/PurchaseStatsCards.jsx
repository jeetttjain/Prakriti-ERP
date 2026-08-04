import React from "react";

/**
 * Summary metrics cards for Purchase views.
 * @component
 * @param {Object} props
 * @param {Object} props.stats Statistics state object
 */
export default function PurchaseStatsCards({ stats = {} }) {
  const cards = [
    {
      title: "Total POs",
      value: stats.totalPurchases || 0,
      icon: "📑",
      color: "var(--primary-color)",
      bg: "rgba(34, 197, 94, 0.1)",
    },
    {
      title: "Received Orders",
      value: stats.receivedCount || 0,
      icon: "📥",
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Pending Orders",
      value: stats.pendingCount || 0,
      icon: "⏳",
      color: "#d97706",
      bg: "rgba(217, 119, 6, 0.1)",
    },
    {
      title: "Replenishment Spent",
      value: `₹${(stats.totalSpent || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: "💰",
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.1)",
    },
  ];

  return (
    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="stat-card"
          style={{
            background: "var(--card-bg, white)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-light, #6b7280)", fontWeight: "500" }}>{card.title}</span>
            <h3 style={{ margin: "8px 0 0 0", fontSize: "1.25rem", fontWeight: "700", color: "var(--text-main)" }}>
              {card.value}
            </h3>
          </div>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: card.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.3rem",
            }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
