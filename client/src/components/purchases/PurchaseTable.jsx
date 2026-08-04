import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseStore } from "../../store/purchaseStore";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";
import ConfirmationModal from "../common/ConfirmationModal";
import ReceivePurchaseModal from "./ReceivePurchaseModal";

/**
 * Grid list displaying Purchase Order replenished entries.
 * @component
 * @param {Object} props
 * @param {Function} [props.onOpenEdit] Option opens edit overlays
 */
export default function PurchaseTable({ onOpenEdit }) {
  const {
    purchases,
    loading,
    error,
    currentPage,
    totalPages,
    setPagination,
    refreshPurchases,
    statusFilter,
    supplierFilter,
    fetchPurchases,
    cancelPO,
  } = usePurchaseStore();

  const navigate = useNavigate();
  const [cancelId, setCancelId] = useState(null);
  const [receiveItem, setReceiveItem] = useState(null);

  const handlePageChange = (page) => {
    setPagination(page);
    fetchPurchases(page, statusFilter, supplierFilter);
  };

  const handleCancelConfirm = async () => {
    if (cancelId) {
      try {
        await cancelPO(cancelId, "Admin Console User");
        setCancelId(null);
      } catch (err) {
        alert("Failed to cancel Purchase Order: " + err.message);
      }
    }
  };

  if (loading) {
    return <TableSkeleton cols={7} rows={5} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refreshPurchases} />;
  }

  if (purchases.length === 0) {
    return <EmptyState message="No Purchase Orders found matching filters." />;
  }

  return (
    <div className="table-wrapper" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="table-container" style={{ overflowX: "auto", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>PO Number</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Supplier Partner</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Order Date</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Type</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563", textAlign: "right" }}>Grand Total</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Status</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "0.875rem" }}>
            {purchases.map((item) => {
              const supplierName = item.supplierSnapshot?.businessName || item.supplierId?.businessName || "N/A";
              return (
                <tr key={item._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "600" }}>{item.purchaseNumber}</td>
                  <td style={{ padding: "12px 16px", fontWeight: "700" }}>{supplierName}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {new Date(item.purchaseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "2px 6px", background: "#f3f4f6", borderRadius: "4px", fontSize: "0.75rem" }}>
                      {item.purchaseType}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "600" }}>
                    ₹{(item.grandTotal || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`badge ${
                      item.purchaseStatus === "Received"
                        ? "badge-success"
                        : item.purchaseStatus === "Cancelled"
                        ? "badge-danger"
                        : item.purchaseStatus === "Ordered"
                        ? "badge-warning"
                        : "badge-info"
                    }`}>
                      {item.purchaseStatus}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/purchases/${item._id}`)}
                      >
                        Details
                      </button>
                      
                      {/* Actions enabled for active states */}
                      {["Draft", "Ordered"].includes(item.purchaseStatus) && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setReceiveItem(item)}
                          >
                            Receive
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setCancelId(item._id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Confirmation overlays */}
      {cancelId && (
        <ConfirmationModal
          title="Cancel Purchase Order"
          message="Are you sure you want to cancel this replenishing order? This action is permanent and no inventory updates will happen."
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelId(null)}
        />
      )}

      {receiveItem && (
        <ReceivePurchaseModal
          purchase={receiveItem}
          onClose={() => setReceiveItem(null)}
          onSuccess={refreshPurchases}
        />
      )}
    </div>
  );
}
