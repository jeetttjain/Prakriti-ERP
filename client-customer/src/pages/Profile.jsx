import React, { useEffect, useState } from "react";
import { getProfile } from "../services/customerService";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then((res) => setProfile(res.data || res)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Account Profile</h3>

      <div style={{ background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div><strong>Business Name:</strong> {profile?.businessName || "Restaurant Partner"}</div>
        <div><strong>Contact Person:</strong> {profile?.personName || "N/A"}</div>
        <div><strong>Mobile:</strong> {profile?.mobile || "N/A"}</div>
        <div><strong>Pricing Tier:</strong> {profile?.pricingTier || "WHOLESALE"}</div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
