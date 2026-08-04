import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePaymentStore } from "../store/paymentStore";
import { ROUTES } from "../constants/routes";
import PaymentStatusBadge from "../components/payments/PaymentStatusBadge";
import PaymentTimeline from "../components/payments/PaymentTimeline";
import PaymentSummaryCard from "../components/payments/PaymentSummaryCard";
import FeaturePlaceholder from "../components/common/FeaturePlaceholder";
import ConfirmationModal from "../components/common/ConfirmationModal";

/**
 * Detailed B2B Payment collections record dashboard view.
 * @component
 */
export default function PaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedPayment, loading, error, selectPayment, clearSelectedPayment } = usePaymentStore();

  const [placeholderData, setPlaceholderData] = useState(null);

  useEffect(() => {
    if (id) {
      selectPayment(id);
    }
    return () => {
      clearSelectedPayment();
    };
  }, [id, selectPayment, clearSelectedPayment]);

  const handlePlaceholderRequest = (title, message) => {
    setPlaceholderData({ title, message });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <div className="loader-spinner" style={{ border: "3px solid #f3f3f3", borderTop: "3px solid #16a34a", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
        <span>Retrieving payment collection logs...</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", textAlign: "center", border: "1px solid #fee2e2", borderRadius: "8px", background: "#fef2f2", color: "#991b1b" }}>
        <h4 style={{ fontWeight: "600", marginBottom: "8px" }}>Error Loading Payment</h4>
        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.PAYMENTS)}>
          Back to Payments
        </button>
      </div>
    );
  }

  if (!selectedPayment) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <p>Payment transaction entry not found.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.PAYMENTS)} style={{ marginTop: "12px" }}>
          Back to Payments
        </button>
      </div>
    );
  }

  const invoice = selectedPayment.invoiceId || {};
  const customer = selectedPayment.customerId || {};

  return (
    <section id="view-payment-details" className="view-section">
      <div className="view-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.PAYMENTS)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Payments
        </button>
        <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handlePlaceholderRequest("Print Receipt", "Customer receipt printing layout trigger will launch here.")}
          >
            🖨️ Print Receipt
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handlePlaceholderRequest("Email Receipt", "Automated customer email receipt dispatch logs will launch here.")}
          >
            📧 Email Receipt
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handlePlaceholderRequest("Send WhatsApp", "WhatsApp customer receipt notification dispatch will launch here.")}
          >
            💬 WhatsApp Receipt
          </button>
        </div>
        <div className="view-title" style={{ marginTop: "16px" }}>
          <h1>Payment {selectedPayment.paymentNumber}</h1>
          <p>Receipt Number: {selectedPayment.receiptNumber} | Status: {selectedPayment.receiptStatus}</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Side main card details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Detailed summary */}
          <PaymentSummaryCard payment={selectedPayment} />

          {/* Payment Notes */}
          {selectedPayment.notes && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Payment Notes</h3>
              </div>
              <div className="card-content" style={{ padding: "16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                "{selectedPayment.notes}"
              </div>
            </div>
          )}

          {/* Future sections placeholders */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FeaturePlaceholder
              title="Bank reconciliations"
              description="Future automatic imports of CSV bank transactions statements, matching UPI identifiers records, and reconciliation audit tags are locked until Bank Reconciliation Module is deployed."
            />
            <FeaturePlaceholder
              title="Accounting entries"
              description="Future double-entry bookkeeping ledger adjustments, supplier credits offsets, and automated tax accounting sheets are locked until Ledger Module is deployed."
            />
          </div>

        </div>

        {/* Right Side panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Status logs card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Payment Status</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-light)" }}>Payment Status:</span>
                <PaymentStatusBadge value={selectedPayment.paymentStatus} />
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Payment Date:</span>
                  <strong>{new Date(selectedPayment.paymentDate).toLocaleDateString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Settlement Date:</span>
                  <strong>{selectedPayment.settlementDate ? new Date(selectedPayment.settlementDate).toLocaleDateString("en-IN") : "Pending Settlement"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Payment Method:</span>
                  <strong>{selectedPayment.paymentMethod}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Payment Type:</span>
                  <strong>{selectedPayment.paymentType}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Payment Source:</span>
                  <strong>{selectedPayment.paymentSource}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Reconciliation:</span>
                  <strong>{selectedPayment.reconciliationStatus}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Invoice Information</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-light)" }}>Invoice Number:</span>
                <strong>{invoice.invoiceNumber || "Manual"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-light)" }}>Invoice Date:</span>
                <strong>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN") : "-"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-light)" }}>Grand Total:</span>
                <strong>₹{(invoice.grandTotal || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Customer Snapshot */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Customer Information</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>Business Name:</span>
                <strong style={{ color: "var(--text-main)" }}>{customer.businessName}</strong>
              </div>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>Contact Person:</span>
                <strong style={{ color: "var(--text-main)" }}>{customer.personName}</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>Contact Number:</span>
                <strong style={{ color: "var(--text-main)" }}>{customer.contactNumber || customer.mobile}</strong>
              </div>
            </div>
          </div>

          {/* Timeline audit log card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Payment Timeline</h3>
            </div>
            <div className="card-content" style={{ padding: "16px" }}>
              <PaymentTimeline timeline={selectedPayment.paymentTimeline} />
            </div>
          </div>

        </div>

      </div>

      <ConfirmationModal
        isOpen={!!placeholderData}
        title={placeholderData?.title || ""}
        message={placeholderData?.message || ""}
        onConfirm={() => setPlaceholderData(null)}
        onCancel={null}
      />
    </section>
  );
}
