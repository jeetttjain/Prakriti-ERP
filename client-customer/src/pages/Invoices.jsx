import React, { useEffect, useState } from "react";
import { getInvoices } from "../services/customerService";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    getInvoices().then((res) => setInvoices(res.data || res.invoices || res || [])).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Invoices & Billing Statements</h3>
      {invoices.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>No invoices available.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {invoices.map((inv) => (
            <div key={inv._id} style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "700" }}>{inv.invoiceNumber}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "N/A"}</div>
              </div>
              <div>
                <div style={{ fontWeight: "800", color: "#0f172a" }}>₹{inv.grandTotal || 0}</div>
                <span className="badge badge-info">{inv.invoiceStatus || "Issued"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <MobileBottomNav />
    </div>
  );
}
