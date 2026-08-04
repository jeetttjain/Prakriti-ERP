import React, { useEffect, useState } from "react";
import api from "../services/api";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    api.get("/customer-portal/notifications").then((res) => setNotifs(res.data?.data || [])).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Notifications</h3>
      {notifs.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>No notifications at this time.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {notifs.map((n) => (
            <div key={n._id} style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{n.title || "Notification"}</div>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>{n.message}</p>
            </div>
          ))}
        </div>
      )}
      <MobileBottomNav />
    </div>
  );
}
