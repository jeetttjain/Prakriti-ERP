import React from "react";

/**
 * Summary card for Audit Stats overview.
 * @component
 * @param {Object} props
 * @param {string} props.title Card header title
 * @param {number|string} props.value Metric count
 * @param {string} props.icon Icon SVG/Emoji
 * @param {string} [props.color="#16a34a"] Accent color
 */
export default function UserActivityCard({ title, value, icon, color = "#16a34a" }) {
  return (
    <div
      className="card"
      style={{
        padding: "16px",
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "8px",
          background: `${color}15`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.3rem",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", color: "#6b7280" }}>
          {title}
        </div>
        <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--text-main)", marginTop: "2px" }}>
          {value || 0}
        </div>
      </div>
    </div>
  );
}
