import React, { useState } from "react";
import { useInventoryStore } from "../../store/inventoryStore";

/**
 * Modal overlay form for updating inventory stock levels.
 * Supports increments, decrements, and direct value overrides (corrections).
 * @component
 * @param {Object} props
 * @param {Object} props.inventory Active inventory document record
 * @param {Function} props.onClose Modal dismiss trigger
 */
export default function InventoryAdjustmentModal({ inventory, onClose }) {
  const { adjustStock } = useInventoryStore();
  const [adjustmentType, setAdjustmentType] = useState("Increase"); // 'Increase' | 'Decrease' | 'Correction'
  const [qtyValue, setQtyValue] = useState("");
  const [reason, setReason] = useState("Manual Entry");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const valueNum = Number(qtyValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      setErrorMsg("Please enter a valid positive quantity/value.");
      return;
    }

    const currentStock = Number(inventory.currentStock) || 0;
    let newStockValue = currentStock;

    if (adjustmentType === "Increase") {
      newStockValue = currentStock + valueNum;
    } else if (adjustmentType === "Decrease") {
      if (currentStock < valueNum) {
        setErrorMsg(`Cannot decrease by ${valueNum} units. Only ${currentStock} units available.`);
        return;
      }
      newStockValue = currentStock - valueNum;
    } else if (adjustmentType === "Correction") {
      newStockValue = valueNum;
    }

    setIsSubmitting(true);
    try {
      await adjustStock({
        productId: inventory.productId?._id || inventory.productId,
        newStockValue,
        remarks: remarks || `Manual adjustment: ${adjustmentType}`,
        movementReason: reason,
        createdBy: "Admin Console User",
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save stock adjustment.");
      setIsSubmitting(false);
    }
  };

  const reasons = [
    "Manual Entry",
    "Customer Return",
    "Supplier Return",
    "Stock Audit",
    "Damage",
    "Expiry",
    "Correction",
    "Transfer",
  ];

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
          maxWidth: "480px",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontWeight: "700" }}>Adjust Stock Level</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "16px", padding: "12px", background: "#f3f4f6", borderRadius: "8px", fontSize: "0.85rem" }}>
          <strong>Product:</strong> {inventory.productId?.productName} ({inventory.productId?.productCode}) <br />
          <strong>Current Stock:</strong> {inventory.currentStock} {inventory.stockUnit}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {errorMsg && (
            <div style={{ padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fee2e2", borderRadius: "6px", fontSize: "0.85rem" }}>
              {errorMsg}
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>Adjustment Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {["Increase", "Decrease", "Correction"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAdjustmentType(type)}
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    background: adjustmentType === type ? "var(--primary-color, #22c55e)" : "none",
                    color: adjustmentType === type ? "#fff" : "var(--text-main)",
                    fontWeight: "600",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="qty-val" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
              {adjustmentType === "Correction" ? "New Stock Level" : "Quantity to Change"}
            </label>
            <input
              id="qty-val"
              type="number"
              className="form-input"
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
              required
              min="0"
              step="any"
              value={qtyValue}
              onChange={(e) => setQtyValue(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>

          <div>
            <label htmlFor="adjustment-reason" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>Reason Code</label>
            <select
              id="adjustment-reason"
              className="form-select"
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="adjustment-remarks" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>Audit Remarks</label>
            <textarea
              id="adjustment-remarks"
              className="form-textarea"
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", minHeight: "60px" }}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide a reason or audit note..."
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
