import React from "react";
import { useNavigate } from "react-router-dom";
import { useInventoryStore } from "../../store/inventoryStore";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";
import StockStatusBadge from "./StockStatusBadge";

/**
 * Renders the main paginated inventory list table.
 * @component
 * @param {Object} props
 * @param {Function} props.onOpenAdjustment Trigger callback to open adjust modal
 * @param {Function} props.onOpenHistory Trigger callback to open history modal
 */
export default function InventoryTable({ onOpenAdjustment, onOpenHistory }) {
  const {
    inventoryList,
    loading,
    error,
    currentPage,
    totalPages,
    setPagination,
    refreshInventory,
    statusFilter,
    locationFilter,
    fetchInventory,
  } = useInventoryStore();

  const navigate = useNavigate();

  const handlePageChange = (page) => {
    setPagination(page);
    fetchInventory(page, statusFilter, locationFilter);
  };

  if (loading) {
    return <TableSkeleton cols={12} rows={5} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refreshInventory} />;
  }

  if (inventoryList.length === 0) {
    return <EmptyState message="No inventory stock profiles match the active search filters." />;
  }

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

  return (
    <div className="table-wrapper" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="table-container" style={{ overflowX: "auto", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Inventory Code</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Product</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Category</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Current Stock</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Reserved</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Available</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Min</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Reorder</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Location</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Status</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Last Updated</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "0.875rem" }}>
            {inventoryList.map((item) => {
              const productName = item.productId?.productName || "Deleted Product";
              const productCode = item.productId?.productCode || "N/A";
              const category = item.productId?.category || "N/A";
              const unit = item.stockUnit || "Kg";

              return (
                <tr key={item._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "600" }}>{item.inventoryCode}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "700" }}>{productName}</span>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{productCode}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{category}</td>
                  <td style={{ padding: "12px 16px", fontWeight: "600" }}>{item.currentStock} {unit}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{item.reservedStock} {unit}</td>
                  <td style={{ padding: "12px 16px", fontWeight: "600", color: item.availableStock <= item.minimumStock ? "#ef4444" : "var(--text-main)" }}>
                    {item.availableStock} {unit}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{item.minimumStock}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{item.reorderLevel}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", background: "#f3f4f6", borderRadius: "4px", fontSize: "0.75rem" }}>
                      {item.location}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StockStatusBadge status={item.stockStatus} />
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: "0.8rem" }}>
                    {formatDateTime(item.lastMovementDate || item.updatedAt)}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        onClick={() => navigate(`/inventory/${item._id}`)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        onClick={() => onOpenAdjustment(item)}
                      >
                        Adjust
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        onClick={() => onOpenHistory(item)}
                      >
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
