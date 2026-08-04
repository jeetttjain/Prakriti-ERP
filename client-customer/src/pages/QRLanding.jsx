import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import QRScannerModal from "../components/QRScannerModal";

/**
 * QR First Landing Screen.
 * Two options only:
 * 1. Scan Restaurant QR (Primary CTA)
 * 2. Login with Mobile Number (Secondary CTA)
 * @component
 */
export default function QRLanding() {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleQRSuccess = (qrSessionData) => {
    navigate(ROUTES.PRODUCTS);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        background: "linear-gradient(180deg, #16a34a 0%, #15803d 100%)",
        color: "#ffffff",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Brand Header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "8px" }}>🥦</div>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "1.8rem", fontWeight: "800" }}>Prakriti Fresh</h1>
        <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>B2B Restaurant Vegetable & Fresh Produce Ordering</p>
      </div>

      {/* Action Card */}
      <div
        style={{
          background: "#ffffff",
          color: "#0f172a",
          borderRadius: "16px",
          padding: "28px 20px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          boxSizing: "border-box",
        }}
      >
        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 20px 0" }}>
          Scan your restaurant QR code to browse daily wholesale price lists and place instant orders.
        </p>

        {/* Option 1: Primary CTA */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsScannerOpen(true)}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "1rem",
            fontWeight: "700",
            marginBottom: "14px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
          }}
        >
          📷 Scan Restaurant QR
        </button>

        {/* Option 2: Secondary CTA */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(ROUTES.LOGIN)}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "0.9rem",
            fontWeight: "600",
            borderRadius: "10px",
          }}
        >
          📱 Login with Mobile Number
        </button>
      </div>

      {/* Footer info */}
      <div style={{ marginTop: "40px", fontSize: "0.75rem", opacity: 0.7 }}>
        Powered by Prakriti ERP Platform • Instant B2B Fulfillment
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={handleQRSuccess}
      />
    </div>
  );
}
