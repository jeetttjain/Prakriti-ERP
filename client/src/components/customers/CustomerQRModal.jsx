import { ROUTES } from "../../constants/routes";

/**
 * Renders ordering portal simulated QR canvas layout.
 * @component
 * @param {Object} props Props
 * @param {Object} props.customer Active customer profile
 * @param {Function} props.onClose Modal close callback trigger
 */
export default function CustomerQRModal({ customer, onClose }) {
  if (!customer) return null;

  const url = `${window.location.origin}${ROUTES.CUSTOMER_ORDERING}?id=${customer._id}`;

  return (
    <div className="modal-overlay" style={{ display: "flex" }}>
      <div className="modal-box" style={{ margin: "auto" }}>
        <div className="modal-header">
          <h3 className="modal-title">{customer.businessName} Ordering Portal</h3>
          <button type="button" className="btn-close" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-light)" }}>×</button>
        </div>
        <div className="modal-body" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-light)", textAlign: "center", marginBottom: "20px" }}>
            Staff can scan this ordering code or visit the portal to place daily orders in 30 seconds.
          </p>
          <div className="qr-preview-box" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <div className="qr-canvas-mock" style={{ width: "160px", height: "160px", border: "1px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ width: "130px", height: "130px", background: "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 20px 20px" }}></div>
              <div className="qr-logo-overlay" style={{ position: "absolute", background: "#16a34a", color: "#fff", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" }}>P</div>
            </div>
            <div className="qr-link-copy" style={{ fontSize: "0.75rem", color: "var(--text-muted)", wordBreak: "break-all", background: "#fff", padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: "4px", width: "100%" }}>
              {url}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <a href={`${ROUTES.CUSTOMER_ORDERING}?id=${customer._id}&step=auth`} target="_blank" rel="noreferrer" className="btn btn-primary">
            Test Ordering Flow
          </a>
        </div>
      </div>
    </div>
  );
}
