import React, { useState } from "react";
import { useCustomerStore } from "../store/customerStore";

/**
 * QR Code scanner modal with camera simulation and manual QR ID input.
 * @component
 */
export default function QRScannerModal({ isOpen, onClose, onSuccess }) {
  const { scanQRCode } = useCustomerStore();
  const [manualCode, setManualCode] = useState("QR-REST-1001-BR01");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleScan = async (codeToScan) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanQRCode(codeToScan || manualCode, "TOK-DEMO-123");
      setLoading(false);
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to validate QR Code.");
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "16px" }}>
      <div style={{ background: "#ffffff", width: "100%", maxWidth: "400px", borderRadius: "12px", padding: "24px", boxSizing: "border-box" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>Scan Restaurant QR</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
        </div>

        {/* Viewfinder simulation */}
        <div style={{ width: "100%", height: "200px", background: "#0f172a", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#38bdf8", marginBottom: "16px", border: "2px dashed #38bdf8" }}>
          <span style={{ fontSize: "2rem", marginBottom: "8px" }}>📷</span>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Align QR code within camera frame</span>
        </div>

        {error && <div style={{ color: "#dc2626", background: "#fef2f2", padding: "8px", borderRadius: "6px", fontSize: "0.8rem", marginBottom: "12px" }}>{error}</div>}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Or Enter QR Identifier</label>
          <input
            type="text"
            className="form-control"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", padding: "12px" }}
          disabled={loading}
          onClick={() => handleScan(manualCode)}
        >
          {loading ? "Validating QR..." : "Simulate QR Scan"}
        </button>
      </div>
    </div>
  );
}
