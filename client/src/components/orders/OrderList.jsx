import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";
import OrderStatusBadge from "./OrderStatusBadge";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Memoized list row component for Order list table.
 * @component
 */
const OrderRow = React.memo(({ order, onOpenEdit, onArchive, onViewDetails }) => {
  const customerName = order.customerSnapshot?.businessName || order.customerId?.businessName || "Unknown Customer";
  
  return (
    <tr>
      <td style={{ fontWeight: 700, color: "var(--text-main)" }}>{order.orderNumber}</td>
      <td>{customerName}</td>
      <td>{new Date(order.orderDate).toLocaleDateString("en-IN")}</td>
      <td style={{ fontWeight: 600 }}>₹{(order.grandTotal || 0).toFixed(2)}</td>
      <td>
        <OrderStatusBadge type="order" value={order.orderStatus} />
      </td>
      <td>
        <OrderStatusBadge type="payment" value={order.paymentStatus} />
      </td>
      <td>
        <OrderStatusBadge type="invoice" value={order.invoiceStatus} />
      </td>
      <td>
        <OrderStatusBadge type="delivery" value={order.deliveryStatus} />
      </td>
      <td style={{ textAlign: "right" }}>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenEdit(order)}
            disabled={order.isLocked}
            title={order.isLocked ? "Order locked for editing" : `Edit details for ${order.orderNumber}`}
            aria-label={`Edit ${order.orderNumber}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onViewDetails(order._id)}
            title={`View log details for ${order.orderNumber}`}
            aria-label={`Details ${order.orderNumber}`}
          >
            View
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            style={{ backgroundColor: "#ef4444", borderColor: "#ef4444" }}
            onClick={() => onArchive(order._id)}
            title={`Archive order ${order.orderNumber}`}
            aria-label={`Archive ${order.orderNumber}`}
          >
            Archive
          </button>
        </div>
      </td>
    </tr>
  );
});

OrderRow.displayName = "OrderRow";

/**
 * Renders a paginated wholesale orders transaction list.
 * @component
 * @param {Object} props Props
 * @param {Function} props.onOpenEdit Trigger opens edit modal form
 */
export default function OrderList({ onOpenEdit }) {
  const {
    orders,
    loading,
    error,
    currentPage,
    totalPages,
    setPagination,
    fetchOrders,
    archiveOrder,
    statusFilter,
    paymentStatusFilter,
    deliveryStatusFilter,
    customerFilter,
    startDateFilter,
    endDateFilter
  } = useOrderStore();

  const navigate = useNavigate();
  const isFirstRender = useRef(true);
  const [archiveId, setArchiveId] = useState(null);

  // Synchronize loading (ignoring dual fetches on mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchOrders(currentPage);
  }, [
    currentPage,
    fetchOrders,
    statusFilter,
    paymentStatusFilter,
    deliveryStatusFilter,
    customerFilter,
    startDateFilter,
    endDateFilter
  ]);

  const handlePageChange = useCallback((page) => {
    setPagination(page);
  }, [setPagination]);

  const handleArchiveClick = useCallback((id) => {
    setArchiveId(id);
  }, []);

  const handleConfirmArchive = async () => {
    if (archiveId) {
      try {
        await archiveOrder(archiveId);
      } catch {
        // Handled in store
      } finally {
        setArchiveId(null);
      }
    }
  };

  const handleViewDetails = useCallback((id) => {
    navigate(`/orders/${id}`);
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  if (loading) {
    return <TableSkeleton rows={5} columns={9} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        message="No orders found matching the filter criteria."
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
              <th>Order Number</th>
              <th>Customer</th>
              <th>Order Date</th>
              <th>Grand Total</th>
              <th>Order Status</th>
              <th>Payment Status</th>
              <th>Invoice Status</th>
              <th>Delivery Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <OrderRow
                key={o._id}
                order={o}
                onOpenEdit={onOpenEdit}
                onArchive={handleArchiveClick}
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
        isOpen={!!archiveId}
        title="Archive Order?"
        message="Are you sure you want to archive this wholesale order record? This action will not permanently delete historical ledger records but hides it from current indexes."
        onConfirm={handleConfirmArchive}
        onCancel={() => setArchiveId(null)}
      />
    </div>
  );
}
