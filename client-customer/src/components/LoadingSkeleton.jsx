import React from "react";

export default function LoadingSkeleton({ cards = 4 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
      {Array.from({ length: cards }).map((_, idx) => (
        <div key={idx} style={{ background: "#e2e8f0", height: "120px", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
  );
}
