import React from "react";

/**
 * Summary cards component for Inventory overview.
 * Displays total catalog products, stocks, reservations, and critical alerts.
 * @component
 * @param {Object} props
 * @param {Object} props.stats Statistics object from Zustand store
 */
export default function InventoryStatsCards({ stats = {} }) {
  const items = [
    {
      title: "Total Items",
      value: stats.totalProducts || 0,
      icon: "📦",
      color: "var(--primary-color)",
      bg: "rgba(34, 197, 94, 0.1)",
    },
    {
      title: "Total Stock",
      value: `${(stats.totalStock || 0).toLocaleString()} units`,
      icon: "⚖️",
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Reserved Stock",
      value: `${(stats.reservedStock || 0).toLocaleString()} units`,
      icon: "🔒",
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.1)",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockCount || 0,
      icon: "⚠️",
      color: "#d97706",
      bg: "rgba(217, 119, 6, 0.1)",
    },
    {
      title: "Out Of Stock",
      value: stats.outOfStockCount || 0,
      icon: "🚨",
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.1)",
    },
  ];

  return (
    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="stat-card"
          style={{
            background: "var(--card-bg, white)",
            border: "1px solid var(--border-color, #e5e7eb)",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-light, #6b7280)", fontWeight: "500" }}>
              {item.title}
            </span>
            <h3 style={{ margin: "8px 0 0 0", fontSize: "1.4rem", fontWeight: "700", color: "var(--text-main, #111827)" }}>
              {item.value}
            </h3>
          </div>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: item.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.3rem",
            }}
          >
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
