import React from "react";

/**
 * Order status timeline component matching business workflows.
 * Received -> Confirmed -> Preparing -> Packed -> Ready for Dispatch -> Out for Delivery -> Delivered
 * @component
 */
export default function OrderTimeline({ currentStatus = "Pending" }) {
  const steps = [
    { label: "Order Received", key: "Pending" },
    { label: "Confirmed", key: "Confirmed" },
    { label: "Preparing", key: "Processing" },
    { label: "Out for Delivery", key: "Dispatched" },
    { label: "Delivered", key: "Delivered" },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case "Pending": return 0;
      case "Confirmed": return 1;
      case "Processing": return 2;
      case "Dispatched": return 3;
      case "Delivered": return 4;
      default: return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
      <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: "700", color: "#0f172a" }}>Order Timeline Status</h4>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px", position: "relative", paddingLeft: "20px" }}>
        <div style={{ position: "absolute", left: "7px", top: "10px", bottom: "10px", width: "2px", background: "#e2e8f0" }} />

        {steps.map((step, idx) => {
          const isDone = idx <= activeIndex;
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-20px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: isDone ? "#16a34a" : "#cbd5e1",
                  border: "2px solid #ffffff",
                }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: isDone ? "700" : "500", color: isDone ? "#15803d" : "#64748b" }}>
                {step.label} {isDone && "✓"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
