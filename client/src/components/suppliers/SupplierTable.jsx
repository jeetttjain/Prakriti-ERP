import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupplierStore } from "../../store/supplierStore";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Grid list displaying supplier partner entries.
 * @component
 * @param {Object} props
 * @param {Function} props.onOpenEdit Trigger opens form modal for updates
 */
export default function SupplierTable({ onOpenEdit }) {
  const {
    suppliers,
    loading,
    error,
    currentPage,
    totalPages,
    setPagination,
    refreshSuppliers,
    statusFilter,
    categoryFilter,
    fetchSuppliers,
    removeSupplier,
  } = useSupplierStore();

  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);

  const handlePageChange = (page) => {
    setPagination(page);
    fetchSuppliers(page, statusFilter, categoryFilter);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await removeSupplier(deleteId);
        setDeleteId(null);
      } catch (err) {
        alert(err.message || "Failed to delete supplier partner.");
      }
    }
  };

  if (loading) {
    return <TableSkeleton cols={9} rows={5} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refreshSuppliers} />;
  }

  if (suppliers.length === 0) {
    return <EmptyState message="No supplier partner profiles found matching criteria." />;
  }

  return (
    <div className="table-wrapper" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="table-container" style={{ overflowX: "auto", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Supplier Code</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Business Name</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Contact Person</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Mobile</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>GSTIN</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Category</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Rating</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563" }}>Status</th>
              <th style={{ padding: "12px 16px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#4b5563", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "0.875rem" }}>
            {suppliers.map((item) => (
              <tr key={item._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "12px 16px", fontWeight: "600" }}>{item.supplierCode}</td>
                <td style={{ padding: "12px 16px", fontWeight: "700" }}>{item.businessName}</td>
                <td style={{ padding: "12px 16px" }}>{item.personName}</td>
                <td style={{ padding: "12px 16px" }}>{item.mobile}</td>
                <td style={{ padding: "12px 16px" }}>{item.gst || "N/A"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "4px 8px", background: "#f3f4f6", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "500" }}>
                    {item.supplierCategory}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: "#eab308", fontWeight: "600" }}>
                  {"★".repeat(item.supplierRating || 5)}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span className={`badge ${item.status === "Active" ? "badge-success" : "badge-danger"}`}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/suppliers/${item._id}`)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteId(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {deleteId && (
        <ConfirmationModal
          title="Remove Supplier Partner"
          message="Are you sure you want to remove this supplier partner? This action is permanent and cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
