import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePaymentStore } from "../../store/paymentStore";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";
import PaymentStatusBadge from "./PaymentStatusBadge";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Memoized list row component for Payment list table.
 * @component
 */
const PaymentRow = React.memo(({ payment, onOpenEdit, onArchive, onViewDetails, onReceiptPlaceholder }) => {
  const customerName = payment.customerId?.businessName || "Unknown Customer";
  const invoiceNumber = payment.invoiceId?.invoiceNumber || "Manual";

  return (
    <tr>
      <td style={{ fontWeight: 700, color: "var(--text-main)" }}>{payment.paymentNumber}</td>
      <td style={{ fontWeight: 600 }}>{payment.receiptNumber}</td>
      <td style={{ fontWeight: 600 }}>{invoiceNumber}</td>
      <td>{customerName}</td>
      <td>{new Date(payment.paymentDate).toLocaleDateString("en-IN")}</td>
      <td>
        <span className="badge badge-info">{payment.paymentMethod}</span>
      </td>
      <td style={{ fontWeight: 600 }}>₹{(payment.amountReceived || 0).toFixed(2)}</td>
      <td style={{ fontWeight: 600 }}>₹{(payment.netReceived || 0).toFixed(2)}</td>
      <td>
        <PaymentStatusBadge value={payment.paymentStatus} />
      </td>
      <td style={{ textAlign: "right" }}>
        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenEdit(payment)}
            title={payment.paymentStatus === "Completed" ? "View Completed Details" : "Edit details"}
            aria-label={`Edit ${payment.paymentNumber}`}
          >
            {payment.paymentStatus === "Completed" ? "View" : "Edit"}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onViewDetails(payment._id)}
            title={`View Dashboard details for ${payment.paymentNumber}`}
            aria-label={`Details ${payment.paymentNumber}`}
          >
            Details
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: "4px 8px" }}
            onClick={() => onReceiptPlaceholder(payment)}
            title="Receipt generation placeholder options"
          >
            🧾
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            style={{ backgroundColor: "#ef4444", borderColor: "#ef4444" }}
            onClick={() => onArchive(payment._id)}
            title={`Archive payment ${payment.paymentNumber}`}
            aria-label={`Archive ${payment.paymentNumber}`}
          >
            Archive
          </button>
        </div>
      </td>
    </tr>
  );
});

PaymentRow.displayName = "PaymentRow";

/**
 * Renders a paginated cash collections payments transaction list.
 * @component
 * @param {Object} props Props
 * @param {Function} props.onOpenEdit Trigger opens edit/view modal form
 * @param {Function} props.onPlaceholderAction Callback tracking placeholder modal requests
 */
export default function PaymentList({ onOpenEdit, onPlaceholderAction }) {
  const {
    payments,
    loading,
    error,
    currentPage,
    totalPages,
    setPagination,
    fetchPayments,
    archivePayment,
    statusFilter,
    methodFilter,
    typeFilter,
    customerFilter,
    startDateFilter,
    endDateFilter
  } = usePaymentStore();

  const navigate = useNavigate();
  const isFirstRender = useRef(true);
  const [archiveId, setArchiveId] = useState(null);

  // Load payments list
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchPayments(currentPage);
  }, [
    currentPage,
    fetchPayments,
    statusFilter,
    methodFilter,
    typeFilter,
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
        await archivePayment(archiveId);
      } catch {
        // Handled in store
      } finally {
        setArchiveId(null);
      }
    }
  };

  const handleViewDetails = useCallback((id) => {
    navigate(`/payments/${id}`);
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchPayments(currentPage);
  }, [currentPage, fetchPayments]);

  const handleReceiptOptions = useCallback((pay) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.open(`${baseUrl}/export/payment/${pay._id}/pdf`, "_blank");
  }, []);

  if (loading) {
    return <TableSkeleton rows={5} columns={10} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  if (payments.length === 0) {
    return (
      <EmptyState
        message="No payments logged matching the filter criteria."
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
              <th>Payment Number</th>
              <th>Receipt Number</th>
              <th>Invoice Number</th>
              <th>Customer</th>
              <th>Payment Date</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Net Amount</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((pay) => (
              <PaymentRow
                key={pay._id}
                payment={pay}
                onOpenEdit={onOpenEdit}
                onArchive={handleArchiveClick}
                onViewDetails={handleViewDetails}
                onReceiptPlaceholder={handleReceiptOptions}
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
        title="Archive Payment?"
        message="Are you sure you want to archive this payment entry? This action reverses its updates in the Invoice summaries."
        onConfirm={handleConfirmArchive}
        onCancel={() => setArchiveId(null)}
      />
    </div>
  );
}
