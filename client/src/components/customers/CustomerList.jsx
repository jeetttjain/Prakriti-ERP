import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerStore } from "../../store/customerStore";
import { STATUS } from "../../constants/status";
import TableSkeleton from "../common/TableSkeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Memoized list row component for Customer list table.
 * @component
 */
const CustomerRow = React.memo(({ cust, onOpenQR, onOpenEdit, onToggleStatus, onViewDetails }) => {
  const statusBadge = cust.status === STATUS.ACTIVE ? "badge-success" : "badge-danger";
  
  return (
    <tr>
      <td style={{ fontWeight: 700, color: "var(--text-main)" }}>{cust.businessName}</td>
      <td>{cust.personName}</td>
      <td>+91 {cust.contactNumber || cust.mobile}</td>
      <td>+91 {cust.whatsappNumber || cust.contactNumber || cust.mobile}</td>
      <td>
        <span className="badge badge-info">{cust.paymentCycle || 15} Days</span>
      </td>
      <td>
        <span style={{ fontWeight: 600, color: (cust.outstandingBalance || 0) > 0 ? "#dc2626" : "var(--text-main)" }}>
          ₹{(cust.outstandingBalance || cust.totalOutstanding || 0).toFixed(2)}
        </span>
      </td>
      <td>
        <button
          type="button"
          className={`badge ${statusBadge}`}
          onClick={() => onToggleStatus(cust._id, cust.status)}
          style={{ border: "none", cursor: "pointer", display: "inline-block" }}
          title={`Toggle status for ${cust.businessName}`}
          aria-label={`Toggle status. Currently ${cust.status}`}
        >
          {cust.status}
        </button>
      </td>
      <td style={{ textAlign: "right" }}>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenQR(cust)}
            title={`View QR portal code for ${cust.businessName}`}
            aria-label={`View QR portal link for ${cust.businessName}`}
          >
            QR Code
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenEdit(cust)}
            title={`Edit profile for ${cust.businessName}`}
            aria-label={`Edit profile for ${cust.businessName}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onViewDetails(cust._id)}
            title={`View ledger details for ${cust.businessName}`}
            aria-label={`View ledger details for ${cust.businessName}`}
          >
            View Details
          </button>
        </div>
      </td>
    </tr>
  );
});

CustomerRow.displayName = "CustomerRow";

/**
 * Renders a paginated list of partners in a table.
 * Supports skeleton loading states, page navigation controls, and retry handlers.
 * @component
 * @param {Object} props Props
 * @param {Function} props.onOpenQR Trigger opens QR Modal
 * @param {Function} props.onOpenEdit Trigger opens Edit Modal
 */
export default function CustomerList({ onOpenQR, onOpenEdit }) {
  const {
    customers,
    loading,
    error,
    currentPage,
    totalPages,
    setPagination,
    fetchCustomers,
    changeCustomerStatus,
    statusFilter,
    paymentCycleFilter
  } = useCustomerStore();
  
  const navigate = useNavigate();
  const isFirstRender = useRef(true);
  const [confirmStatusData, setConfirmStatusData] = useState(null);

  // Sync pagination page changes (avoiding double fetches on initial mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchCustomers(currentPage, statusFilter, paymentCycleFilter);
  }, [currentPage, fetchCustomers, statusFilter, paymentCycleFilter]);

  const handleToggleStatusClick = useCallback((id, status) => {
    setConfirmStatusData({ id, status });
  }, []);

  const handleConfirmStatusChange = async () => {
    if (confirmStatusData) {
      try {
        const nextStatus = confirmStatusData.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
        await changeCustomerStatus(confirmStatusData.id, nextStatus);
      } catch {
        // Log handled in store
      } finally {
        setConfirmStatusData(null);
      }
    }
  };

  const handlePageChange = useCallback((newPage) => {
    setPagination(newPage);
  }, [setPagination]);

  const handleViewDetails = useCallback((id) => {
    navigate(`/customers/${id}`);
  }, [navigate]);

  const confirmModalMessage = useMemo(() => {
    if (!confirmStatusData) return "";
    const nextStatus = confirmStatusData.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
    return `Are you sure you want to change this customer's status to ${nextStatus}?`;
  }, [confirmStatusData]);

  const handleRetry = useCallback(() => {
    fetchCustomers(currentPage, statusFilter, paymentCycleFilter);
  }, [currentPage, statusFilter, paymentCycleFilter, fetchCustomers]);

  if (loading) {
    return <TableSkeleton rows={5} columns={8} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  if (customers.length === 0) {
    return (
      <EmptyState
        message="No customers registered matching the filter criteria."
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
              <th>Business Name</th>
              <th>Contact Person</th>
              <th>Contact Number</th>
              <th>WhatsApp Number</th>
              <th>Payment Cycle</th>
              <th>Outstanding Balance</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((cust) => (
              <CustomerRow
                key={cust._id}
                cust={cust}
                onOpenQR={onOpenQR}
                onOpenEdit={onOpenEdit}
                onToggleStatus={handleToggleStatusClick}
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
