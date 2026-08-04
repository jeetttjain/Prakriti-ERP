import React, { useState } from "react";
import { usePurchaseStore } from "../../store/purchaseStore";

/**
 * Overlay modal to confirm Purchase Order receipt.
 * Captures receiving user name before incrementing physical inventory.
 * @component
 * @param {Object} props
 * @param {Object} props.purchase Active purchase order record
 * @param {Function} props.onClose Modal dismiss trigger
 * @param {Function} [props.onSuccess] Success callback trigger
 */
export default function ReceivePurchaseModal({ purchase, onClose, onSuccess }) {
  const { receivePO } = usePurchaseStore();
  const [receivedBy, setReceivedBy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receivedBy.trim()) {
      setErrorMsg("Please enter the name of the person receiving the goods.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await receivePO(purchase._id, receivedBy.trim());
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to receive purchase stock.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "440px",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontWeight: "700" }}>Receive Goods & replenish Stock</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "16px", padding: "12px", background: "#fffbeb", color: "#856404", border: "1px solid #ffeeba", borderRadius: "8px", fontSize: "0.85rem" }}>
          ⚠️ <strong>Important:</strong> Proceeding will increase physical inventory levels by the quantities in PO <strong>{purchase.purchaseNumber}</strong>. This action is irreversible.
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {errorMsg && (
            <div style={{ padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fee2e2", borderRadius: "6px", fontSize: "0.85rem" }}>
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="rec-by-input" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>Received By (Name) *</label>
            <input
              id="rec-by-input"
              type="text"
              className="form-input"
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
              required
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              placeholder="e.g. Warehouse Clerk"
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Receiving Goods..." : "Confirm & replenish Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
