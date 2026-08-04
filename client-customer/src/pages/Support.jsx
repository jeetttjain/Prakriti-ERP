import React, { useState } from "react";
import api from "../services/api";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/customer-portal/support", { type: "Order Issue", subject, message });
      setSubmitted(true);
    } catch {
      // Ignore
    }
  };

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Customer Support & Help</h3>

      {submitted ? (
        <div style={{ background: "#dcfce7", color: "#15803d", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
          ✓ Ticket submitted! Our support team will get back to you shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Subject</label>
            <input type="text" className="form-control" required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Message</label>
            <textarea className="form-control" rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: "12px" }}>Submit Support Ticket</button>
        </form>
      )}

      <MobileBottomNav />
    </div>
  );
}
