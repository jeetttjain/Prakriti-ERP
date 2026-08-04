import React, { useEffect, useState } from "react";
import { getOffers } from "../services/customerService";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Offers() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    getOffers().then((res) => setOffers(res.data || res || [])).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Partner Offers & Discounts</h3>
      {offers.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>No active offers currently available.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {offers.map((off) => (
            <div key={off._id} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px", borderRadius: "10px" }}>
              <div style={{ fontWeight: "800", color: "#16a34a", fontSize: "1rem" }}>{off.title || "Bulk Produce Discount"}</div>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#15803d" }}>{off.description || "Enjoy wholesale tier pricing on fresh farm vegetables."}</p>
            </div>
          ))}
        </div>
      )}
      <MobileBottomNav />
    </div>
  );
}
