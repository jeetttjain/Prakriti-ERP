import { useState, useEffect } from "react";
import PaymentSearch from "../components/payments/PaymentSearch";
import PaymentList from "../components/payments/PaymentList";
import PaymentForm from "../components/payments/PaymentForm";
import { usePaymentStore } from "../store/paymentStore";
import ConfirmationModal from "../components/common/ConfirmationModal";

/**
 * Payments Collection Management admin console panel.
 * Co-ordinates search filters, index lists, placeholder triggers, and form overlays.
 * @component
 */
export default function Payments() {
  const { fetchPayments, refreshPayments, loading } = usePaymentStore();
  const [activeFormPayment, setActiveFormPayment] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Placeholder actions feedback modals states
  const [placeholderData, setPlaceholderData] = useState(null);

  // Trigger initial list load
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleOpenCreate = () => {
    setActiveFormPayment(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (payment) => {
    setActiveFormPayment(payment);
    setIsFormOpen(true);
  };

  const handleFormSaved = () => {
    setIsFormOpen(false);
    fetchPayments();
  };

  const handleRefresh = async () => {
    await refreshPayments();
  };

  const handlePlaceholderRequest = (title, message) => {
    setPlaceholderData({ title, message });
  };

  return (
    <section id="view-payments" className="view-section">
      <div className="view-header">
        <div className="view-title">
          <h1>Payments Collections</h1>
          <p>Record, manage, and audit B2B client payment transactions</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={loading ? "spin-icon" : ""}
              style={{ animation: loading ? "spin 1.5s linear infinite" : "none" }}
            >
              <path d="M23 4v6h-6"></path>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Record Payment
          </button>
        </div>
      </div>

      <PaymentSearch />

      <PaymentList
        onOpenEdit={handleOpenEdit}
        onPlaceholderAction={handlePlaceholderRequest}
      />

      {isFormOpen && (
        <PaymentForm
          key={activeFormPayment?._id || "new"}
          payment={activeFormPayment}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleFormSaved}
        />
      )}

      {/* Reusable warning modal dialog used to give feedback on upcoming modules */}
      <ConfirmationModal
        isOpen={!!placeholderData}
        title={placeholderData?.title || ""}
        message={placeholderData?.message || ""}
        onConfirm={() => setPlaceholderData(null)}
        onCancel={null} // Makes it a single OK feedback modal
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}} />
    </section>
  );
}
