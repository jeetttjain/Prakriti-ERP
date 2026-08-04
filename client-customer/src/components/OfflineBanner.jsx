import React, { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{ background: "#b91c1c", color: "#ffffff", padding: "6px 12px", textAlign: "center", fontSize: "0.75rem", fontWeight: "600" }}>
      ⚠️ You are offline. Changes will sync when reconnected.
    </div>
  );
}
