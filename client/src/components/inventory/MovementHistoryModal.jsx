import React, { useEffect } from "react";
import { useInventoryStore } from "../../store/inventoryStore";
import Pagination from "../common/Pagination";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";

/**
 * Modal overlay display showing full paginated audit movement history.
 * @component
 * @param {Object} props
 * @param {Object} props.inventory Active inventory item record
 * @param {Function} props.onClose Modal dismiss trigger
 */
export default function MovementHistoryModal({ inventory, onClose }) {
  const {
    movements,
    movementPage,
    totalMovementPages,
    movementLoading,
    fetchMovementHistory,
  } = useInventoryStore();

  const productId = inventory.productId?._id || inventory.productId;

  useEffect(() => {
    fetchMovementHistory(1, { productId });
  }, [productId, fetchMovementHistory]);

  const handlePageChange = (page) => {
    fetchMovementHistory(page, { productId });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMovementColor = (type) => {
    if (["Opening Stock", "Purchase", "Return", "Reservation Release"].includes(type)) {
      return "#16a34a"; // Green for additions
    }
    if (["Delivery", "Damage", "Reservation"].includes(type)) {
      return "#dc2626"; // Red for reductions/locks
    }
    return "#4b5563"; // Charcoal for corrections/adjustments
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
          maxWidth: "860px",
          maxHeight: "90vh",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontWeight: "700" }}>Stock Movement History</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "16px", padding: "12px", background: "#f3f4f6", borderRadius: "8px", fontSize: "0.85rem" }}>
          <strong>Product:</strong> {inventory.productId?.productName} ({inventory.productId?.productCode}) &nbsp;|&nbsp;
          <strong>Available Stock:</strong> {inventory.availableStock} {inventory.stockUnit}
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: "260px" }}>
          {movementLoading ? (
            <TableSkeleton cols={9} rows={5} />
          ) : movements.length === 0 ? (
            <EmptyState message="No movement history logs recorded for this item." />
          ) : (
            <table className="table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "8px 12px", fontWeight: "600", color: "#4b5563" }}>Movement No</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600", color: "#4b5563" }}>Date</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600", color: "#4b5563" }}>Type</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600", color: "#4b5563" }}>Module</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600", color: "#4b5563" }}>Ref Number</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600", color: "#4b5563", textAlign: "right" }}>Qty</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600", color: "#4b5563", textAlign: "right" }}>Previous</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600", color: "#4b5563", textAlign: "right" }}>New</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600", color: "#4b5563" }}>Created By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "8px 12px", fontWeight: "600" }}>{m.movementNumber}</td>
                    <td style={{ padding: "8px 12px", color: "#6b7280" }}>{formatDateTime(m.createdAt)}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontWeight: "700", color: getMovementColor(m.movementType) }}>
                        {m.movementType}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ padding: "2px 6px", background: "#f3f4f6", borderRadius: "4px", fontSize: "0.75rem" }}>
                        {m.referenceModule}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: "500" }}>{m.referenceNumber || "N/A"}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: "600" }}>
                      {["Delivery", "Damage", "Reservation"].includes(m.movementType) ? "-" : "+"}
                      {m.quantity}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "#6b7280" }}>{m.previousStock}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: "600" }}>{m.newStock}</td>
                    <td style={{ padding: "8px 12px", color: "#6b7280" }}>{m.createdBy || "System"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          {!movementLoading && movements.length > 0 && (
            <Pagination
              currentPage={movementPage}
              totalPages={totalMovementPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
