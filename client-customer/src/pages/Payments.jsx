import React, { useEffect, useState } from "react";
import { getPayments } from "../services/customerService";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    getPayments().then((res) => setPayments(res.data || res.payments || res || [])).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Payment Receipts</h3>
      {payments.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>No payment records found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {payments.map((p) => (
            <div key={p._id} style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "700" }}>{p.paymentNumber || "PAYMENT"}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{p.paymentMethod || "UPI / Bank Transfer"}</div>
              </div>
              <div style={{ fontWeight: "800", color: "#16a34a" }}>₹{p.amount || 0}</div>
            </div>
          ))}
        </div>
      )}
      <MobileBottomNav />
    </div>
  );
}
