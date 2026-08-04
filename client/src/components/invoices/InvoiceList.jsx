import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoiceStore } from "../../store/invoiceStore";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Memoized list row component for Invoice list table.
 * @component
 */
const InvoiceRow = React.memo(({ invoice, onOpenEdit, onArchive, onViewDetails, onPrint, onPdf, onWhatsapp }) => {
  const customerName = invoice.customerSnapshot?.businessName || invoice.customerId?.businessName || "Unknown Customer";
  const orderNumber = invoice.orderId?.orderNumber || "Manual";

  return (
    <tr>
      <td style={{ fontWeight: 700, color: "var(--text-main)" }}>{invoice.invoiceNumber}</td>
      <td style={{ fontWeight: 600 }}>{orderNumber}</td>
      <td>{customerName}</td>
      <td>{new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</td>
      <td>{new Date(invoice.dueDate).toLocaleDateString("en-IN")}</td>
      <td style={{ fontWeight: 600 }}>₹{(invoice.grandTotal || 0).toFixed(2)}</td>
      <td>
        <InvoiceStatusBadge type="invoice" value={invoice.invoiceStatus} />
      </td>
      <td>
        <InvoiceStatusBadge type="payment" value={invoice.paymentStatus} />
      </td>
      <td style={{ textAlign: "right" }}>
        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenEdit(invoice)}
            title={invoice.isLocked ? "View Issued Details" : "Edit Draft details"}
            aria-label={`Edit ${invoice.invoiceNumber}`}
          >
            {invoice.isLocked ? "View" : "Edit"}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onViewDetails(invoice._id)}
            title={`View Dashboard details for ${invoice.invoiceNumber}`}
            aria-label={`Details ${invoice.invoiceNumber}`}
          >
            Details
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: "4px 8px" }}
            onClick={() => onPrint(invoice)}
            title="Print invoice placeholder"
          >
            🖨️
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: "4px 8px" }}
            onClick={() => onPdf(invoice)}
            title="Download PDF placeholder"
          >
            📄
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: "4px 8px" }}
            onClick={() => onWhatsapp(invoice)}
            title="Send WhatsApp invoice placeholder"
          >
            💬
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            style={{ backgroundColor: "#ef4444", borderColor: "#ef4444" }}
            onClick={() => onArchive(invoice._id)}
            title={`Archive invoice ${invoice.invoiceNumber}`}
            aria-label={`Archive ${invoice.invoiceNumber}`}
          >
            Archive
          </button>
        </div>
      </td>
    </tr>
  );
});

InvoiceRow.displayName = "InvoiceRow";

/**
 * Renders a paginated billing invoices transaction list.
 * @component
 * @param {Object} props Props
 * @param {Function} props.onOpenEdit Trigger opens edit/view modal form
 * @param {Function} props.onPlaceholderAction Callback tracking placeholder modal requests
 */
export default function InvoiceList({ onOpenEdit, onPlaceholderAction }) {
  const {
    invoices,
    loading,
    error,
    currentPage,
    totalPages,
    setPagination,
    fetchInvoices,
    archiveInvoice,
    statusFilter,
    paymentStatusFilter,
    customerFilter,
    startDateFilter,
    endDateFilter
  } = useInvoiceStore();

  const navigate = useNavigate();
  const isFirstRender = useRef(true);
  const [archiveId, setArchiveId] = useState(null);

  // Synchronize loading
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchInvoices(currentPage);
  }, [
    currentPage,
    fetchInvoices,
    statusFilter,
    paymentStatusFilter,
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
        await archiveInvoice(archiveId);
      } catch {
        // Handled in store
      } finally {
        setArchiveId(null);
      }
    }
  };

  const handleViewDetails = useCallback((id) => {
    navigate(`/invoices/${id}`);
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchInvoices(currentPage);
  }, [currentPage, fetchInvoices]);

  const handlePrint = useCallback((inv) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.open(`${baseUrl}/export/invoice/${inv._id}/pdf`, "_blank");
  }, []);

  const handlePdf = useCallback((inv) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.open(`${baseUrl}/export/invoice/${inv._id}/pdf`, "_blank");
  }, []);

  const handleWhatsapp = useCallback((inv) => {
    const phone = inv.customerSnapshot?.whatsappNumber || inv.customerId?.whatsappNumber || "";
    const text = encodeURIComponent(`Invoice Details: ${inv.invoiceNumber} | Grand Total: ₹${(inv.grandTotal || 0).toFixed(2)}`);
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, "_blank");
  }, []);

  if (loading) {
    return <TableSkeleton rows={5} columns={9} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        message="No invoices found matching the filter criteria."
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
              <th>Invoice Number</th>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Grand Total</th>
              <th>Invoice Status</th>
              <th>Payment Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <InvoiceRow
                key={inv._id}
                invoice={inv}
                onOpenEdit={onOpenEdit}
                onArchive={handleArchiveClick}
                onViewDetails={handleViewDetails}
                onPrint={handlePrint}
                onPdf={handlePdf}
                onWhatsapp={handleWhatsapp}
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
        title="Archive Invoice?"
        message="Are you sure you want to archive this billing invoice? This action hides it from current indexes but retains it in historical ledger audits."
        onConfirm={handleConfirmArchive}
        onCancel={() => setArchiveId(null)}
      />
    </div>
  );
}
