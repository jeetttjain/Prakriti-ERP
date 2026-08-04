import React from "react";

/**
 * Renders a vertical activity timeline of recent system audit events.
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.events Array of audit log events
 */
export default function ActivityTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return <p style={{ color: "#6b7280", fontStyle: "italic", fontSize: "0.85rem" }}>No recent activity logged.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingLeft: "12px", borderLeft: "2px solid #e2e8f0" }}>
      {events.map((evt) => (
        <div key={evt._id} style={{ position: "relative", paddingLeft: "16px" }}>
          <div
            style={{
              position: "absolute",
              left: "-21px",
              top: "4px",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#16a34a",
              border: "2px solid #ffffff",
            }}
          />
          <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>
            {evt.action}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            by {evt.userSnapshot?.name || "System"} • {new Date(evt.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      ))}
    </div>
  );
}
