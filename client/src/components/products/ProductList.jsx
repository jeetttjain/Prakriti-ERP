import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../store/productStore";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Memoized list row component for Product list table.
 * @component
 */
const ProductRow = React.memo(({ prod, onToggleStatus, onOpenEdit, onViewDetails }) => {
  const statusBadge =
    prod.status === "Active"
      ? "badge-success"
      : prod.status === "Inactive"
      ? "badge-danger"
      : "badge-info"; // Archived

  return (
    <tr>
      <td style={{ fontWeight: 700, color: "var(--text-main)" }}>{prod.productCode}</td>
      <td style={{ fontWeight: 700, color: "var(--text-main)" }}>{prod.productName}</td>
      <td>{prod.category}</td>
      <td>
        <span className="badge badge-info">{prod.unit}</span>
      </td>
      <td>₹{(prod.purchasePrice || 0).toFixed(2)}</td>
      <td>₹{(prod.sellingPrice || 0).toFixed(2)}</td>
      <td>
        <span style={{ color: prod.currentStock <= prod.minimumStock ? "#ef4444" : "var(--text-main)", fontWeight: prod.currentStock <= prod.minimumStock ? 600 : 400 }}>
          {prod.currentStock} {prod.unit}
        </span>
      </td>
      <td>
        <button
          type="button"
          className={`badge ${statusBadge}`}
          onClick={() => onToggleStatus(prod._id, prod.status)}
          style={{ border: "none", cursor: "pointer", display: "inline-block" }}
          title={`Toggle status for ${prod.productName}`}
          aria-label={`Toggle status. Currently ${prod.status}`}
        >
          {prod.status}
        </button>
      </td>
      <td style={{ textAlign: "right" }}>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenEdit(prod)}
            title={`Edit details for ${prod.productName}`}
            aria-label={`Edit details for ${prod.productName}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onViewDetails(prod._id)}
            title={`View log details for ${prod.productName}`}
            aria-label={`View log details for ${prod.productName}`}
          >
            Details
          </button>
        </div>
      </td>
    </tr>
  );
});

ProductRow.displayName = "ProductRow";

/**
 * Renders a paginated list of catalog products.
 * Supports skeleton loading states, page navigation controls, and retry handlers.
 * @component
 * @param {Object} props Props
 * @param {Function} props.onOpenEdit Trigger opens Edit Modal
 */
export default function ProductList({ onOpenEdit }) {
  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    setPagination,
    fetchProducts,
    changeProductStatus,
    statusFilter,
    categoryFilter
  } = useProductStore();

  const navigate = useNavigate();
  const isFirstRender = useRef(true);
  const [confirmStatusData, setConfirmStatusData] = useState(null);

  // Sync pagination page changes (avoiding double fetches on initial mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchProducts(currentPage, statusFilter, categoryFilter);
  }, [currentPage, fetchProducts, statusFilter, categoryFilter]);

  const handleToggleStatusClick = useCallback((id, status) => {
    setConfirmStatusData({ id, status });
  }, []);

  const handleConfirmStatusChange = async () => {
    if (confirmStatusData) {
      try {
        const nextStatus =
          confirmStatusData.status === "Active"
            ? "Inactive"
            : confirmStatusData.status === "Inactive"
            ? "Archived"
            : "Active";
        await changeProductStatus(confirmStatusData.id, nextStatus);
      } catch {
        // Handled in store
      } finally {
        setConfirmStatusData(null);
      }
    }
  };

  const handlePageChange = useCallback((newPage) => {
    setPagination(newPage);
  }, [setPagination]);

  const handleViewDetails = useCallback((id) => {
    navigate(`/products/${id}`);
  }, [navigate]);

  const confirmModalMessage = useMemo(() => {
    if (!confirmStatusData) return "";
    const nextStatus =
      confirmStatusData.status === "Active"
        ? "Inactive"
        : confirmStatusData.status === "Inactive"
        ? "Archived"
        : "Active";
    return `Are you sure you want to change this product's status to ${nextStatus}?`;
  }, [confirmStatusData]);

  const handleRetry = useCallback(() => {
    fetchProducts(currentPage, statusFilter, categoryFilter);
  }, [currentPage, statusFilter, categoryFilter, fetchProducts]);

  if (loading) {
    return <TableSkeleton rows={5} columns={9} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        message="No products found matching the filter criteria."
        onAction={handleRetry}
        actionText="Manual Reload"
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Purchase Price</th>
              <th>Selling Price</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <ProductRow
                key={prod._id}
                prod={prod}
                onToggleStatus={handleToggleStatusClick}
                onOpenEdit={onOpenEdit}
                onViewDetails={handleViewDetails}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <ConfirmationModal
        isOpen={!!confirmStatusData}
        title="Confirm Status Change"
        message={confirmModalMessage}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmStatusData(null)}
      />
    </div>
  );
}
