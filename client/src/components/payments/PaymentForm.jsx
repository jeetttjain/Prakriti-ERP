import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePaymentStore } from "../../store/paymentStore";
import * as invoiceService from "../../services/invoiceService";
import FormError from "../common/FormError";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Creates new payments from outstanding invoices or updates details of draft/pending payments.
 * @component
 * @param {Object} props Props
 * @param {Object|null} props.payment Payment details if editing/viewing, null if creating
 * @param {Function} props.onClose Modal discard trigger
 * @param {Function} props.onSaved Save success callback
 */
export default function PaymentForm({ payment, onClose, onSaved }) {
  const { registerPayment, modifyPayment, error: storeError } = usePaymentStore();
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const modalRef = useRef(null);

  const isReadOnly = useMemo(() => {
    if (!payment) return false;
    return payment.paymentStatus === "Completed";
  }, [payment]);

  const [formData, setFormData] = useState({
    invoiceId: payment?.invoiceId?._id || payment?.invoiceId || "",
    orderId: payment?.orderId?._id || payment?.orderId || "",
    customerId: payment?.customerId?._id || payment?.customerId || "",
    paymentDate: payment ? new Date(payment.paymentDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    settlementDate: payment?.settlementDate ? new Date(payment.settlementDate).toISOString().split("T")[0] : "",
    paymentMethod: payment?.paymentMethod || "UPI",
    paymentSource: payment?.paymentSource || "Admin",
    reconciliationStatus: payment?.reconciliationStatus || "Pending",
    paymentReference: payment?.paymentReference || "",
    amountReceived: payment ? String(payment.amountReceived) : "",
    transactionFee: payment ? String(payment.transactionFee) : "0",
    paymentStatus: payment?.paymentStatus || "Completed",
    paymentType: payment?.paymentType || "Full Payment",
    notes: payment?.notes || ""
  });

  const [formErrors, setFormErrors] = useState({});

  // Retrieve active invoices list on mount
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const result = await invoiceService.getInvoices(1, 150);
        // Only show invoices that are not fully Paid, or match the active invoice ID in Edit mode
        const eligible = (result.data || []).filter(
          (inv) => inv.paymentStatus !== "Paid" || inv._id === formData.invoiceId
        );
        setInvoices(eligible);
      } catch {
        // Load error
      }
    };
    loadInvoices();
  }, [formData.invoiceId]);

  const selectedInvoiceDetails = useMemo(() => {
    return invoices.find((inv) => inv._id === formData.invoiceId) || null;
  }, [invoices, formData.invoiceId]);

  const outstandingLimit = useMemo(() => {
    if (!selectedInvoiceDetails) return 0;
    const paid = selectedInvoiceDetails.paymentSummary?.paidAmount || 0;
    // In edit mode, we must include the current payment amount back to the outstanding limit
    const baseOutstanding = selectedInvoiceDetails.grandTotal - paid;
    if (payment && payment.invoiceId?._id === formData.invoiceId) {
      return baseOutstanding + (payment.amountReceived || 0);
    }
    return baseOutstanding;
  }, [selectedInvoiceDetails, payment, formData.invoiceId]);

  // Handle invoice change and autofill details
  const handleInvoiceChange = (invId) => {
    const invObj = invoices.find((inv) => inv._id === invId);
    if (!invObj) {
      setFormData((prev) => ({
        ...prev,
        invoiceId: "",
        orderId: "",
        customerId: "",
        amountReceived: "",
        paymentType: "Full Payment"
      }));
      return;
    }

    const paid = invObj.paymentSummary?.paidAmount || 0;
    const outstanding = Math.max(0, invObj.grandTotal - paid);

    setFormData((prev) => ({
      ...prev,
      invoiceId: invId,
      orderId: invObj.orderId?._id || invObj.orderId,
      customerId: invObj.customerId?._id || invObj.customerId,
      amountReceived: outstanding.toFixed(2),
      paymentType: "Full Payment"
    }));

    // Clear validation error instantly
    setFormErrors((prev) => ({ ...prev, invoiceId: null, amountReceived: null }));
  };

  // Instant amount validations
  const handleAmountChange = (val) => {
    setFormData((prev) => ({ ...prev, amountReceived: val }));

    const amt = Number(val);
    if (isNaN(amt) || amt <= 0) {
      setFormErrors((prev) => ({ ...prev, amountReceived: "Amount must be greater than zero." }));
    } else if (amt > outstandingLimit + 0.01) {
      setFormErrors((prev) => ({
        ...prev,
        amountReceived: `Payment exceeds outstanding invoice balance of ₹${outstandingLimit.toFixed(2)}.`
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, amountReceived: null }));
    }
  };

  const netReceived = useMemo(() => {
    const amt = Number(formData.amountReceived) || 0;
    const fee = Number(formData.transactionFee) || 0;
    return Math.max(0, amt - fee);
  }, [formData.amountReceived, formData.transactionFee]);

  const postPaymentOutstanding = useMemo(() => {
    const amt = Number(formData.amountReceived) || 0;
    return Math.max(0, outstandingLimit - amt);
  }, [outstandingLimit, formData.amountReceived]);

  const hasUnsavedChanges = useMemo(() => {
    if (isReadOnly) return false;
    const initial = payment ? {
      invoiceId: payment.invoiceId?._id || payment.invoiceId || "",
      paymentDate: new Date(payment.paymentDate).toISOString().split("T")[0],
      paymentMethod: payment.paymentMethod || "UPI",
      paymentReference: payment.paymentReference || "",
      amountReceived: String(payment.amountReceived),
      transactionFee: String(payment.transactionFee || 0),
      paymentStatus: payment.paymentStatus || "Completed",
      paymentType: payment.paymentType || "Full Payment",
      notes: payment.notes || ""
    } : {
      invoiceId: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "UPI",
      paymentReference: "",
      amountReceived: "",
      transactionFee: "0",
      paymentStatus: "Completed",
      paymentType: "Full Payment",
      notes: ""
    };

    return (
      formData.invoiceId !== initial.invoiceId ||
      formData.paymentDate !== initial.paymentDate ||
      formData.paymentMethod !== initial.paymentMethod ||
      formData.paymentReference.trim() !== initial.paymentReference.trim() ||
      formData.amountReceived !== initial.amountReceived ||
      formData.transactionFee !== initial.transactionFee ||
      formData.paymentStatus !== initial.paymentStatus ||
      formData.paymentType !== initial.paymentType ||
      formData.notes.trim() !== initial.notes.trim()
    );
  }, [formData, payment, isReadOnly]);

  const handleCancelClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowConfirmCancel(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Trap ESC keyboard key and window lock scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !showConfirmCancel) {
        handleCancelClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleCancelClose, showConfirmCancel]);

  const handleTabKey = (e) => {
    if (!modalRef.current || e.key !== "Tab") return;
    const focusable = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleCancelClose();
    }
  };

  const validateMainForm = () => {
    const errors = {};
    if (!formData.invoiceId) {
      errors.invoiceId = "Invoice is required.";
    }
    const amt = Number(formData.amountReceived);
    if (isNaN(amt) || amt <= 0) {
      errors.amountReceived = "Amount must be greater than zero.";
    } else if (amt > outstandingLimit + 0.01) {
      errors.amountReceived = `Payment exceeds outstanding balance of ₹${outstandingLimit.toFixed(2)}.`;
    }

    if (isNaN(Number(formData.transactionFee)) || Number(formData.transactionFee) < 0) {
      errors.transactionFee = "Transaction fee must be non-negative.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validateMainForm() || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amountReceived: Number(formData.amountReceived),
        transactionFee: Number(formData.transactionFee),
        netReceived
      };

      if (payment) {
        await modifyPayment(payment._id, payload);
      } else {
        await registerPayment(payload);
      }
      onSaved();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: "flex", overflowY: "auto" }} onClick={handleOutsideClick} onKeyDown={handleTabKey}>
      <div ref={modalRef} className="modal-box" style={{ maxWidth: "600px", margin: "auto" }} tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
        <div className="modal-header">
          <h3 id="form-modal-title" className="modal-title">
            {isReadOnly ? "View Completed Payment Details" : payment ? "Modify Payment Details" : "Record Client Payment"}
          </h3>
          <button type="button" className="btn-close" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-light)" }} onClick={handleCancelClose} title="Close window" aria-label="Close dialog">×</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}>
            {storeError && (
              <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px", padding: "10px", background: "#fee2e2", borderRadius: "6px" }}>
                {storeError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Invoice Document *</label>
              <select
                className="form-select"
                value={formData.invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                required
                disabled={!!payment}
                aria-label="Invoice selector dropdown"
              >
                <option value="">Select Invoice</option>
                {invoices.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoiceNumber} (Total: ₹{inv.grandTotal.toFixed(2)} | Outstanding: ₹{(inv.grandTotal - (inv.paymentSummary?.paidAmount || 0)).toFixed(2)})
                  </option>
                ))}
              </select>
              <FormError error={formErrors.invoiceId} />
            </div>

            {selectedInvoiceDetails && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "12px", background: "#f1f5f9", borderRadius: "6px", marginBottom: "12px", fontSize: "0.8rem" }}>
                <div>
                  <span style={{ color: "var(--text-light)" }}>Billing Customer:</span>
                  <strong style={{ display: "block", color: "var(--text-main)" }}>
                    {selectedInvoiceDetails.customerSnapshot?.businessName || "Details"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-light)" }}>Outstanding Limit:</span>
                  <strong style={{ display: "block", color: "var(--primary)" }}>
                    ₹{outstandingLimit.toFixed(2)}
                  </strong>
                </div>
              </div>
            )}

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Amount Received (₹) *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={formData.amountReceived}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  required
                  disabled={isReadOnly}
                  placeholder="0.00"
                  aria-label="Received cash amount"
                />
                <FormError error={formErrors.amountReceived} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  required
                  disabled={isReadOnly}
                  aria-label="Payment method picker"
                >
                  {["UPI", "Cash", "Bank Transfer", "Cheque", "Card", "Wallet"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Transaction Fee (₹)</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={formData.transactionFee}
                  onChange={(e) => setFormData({ ...formData, transactionFee: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="0.00"
                  aria-label="Processing fee"
                />
                <FormError error={formErrors.transactionFee} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Type</label>
                <select
                  className="form-select"
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  disabled={isReadOnly}
                  aria-label="Payment type classification"
                >
                  <option value="Full Payment">Full Payment</option>
                  <option value="Partial Payment">Partial Payment</option>
                  <option value="Advance">Advance</option>
                  <option value="Adjustment">Adjustment</option>
                  <option value="Refund">Refund</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Reference / Txn ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.paymentReference}
                  onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="Reference number"
                  aria-label="Reference ID"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Payment status</label>
                <select
                  className="form-select"
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  disabled={isReadOnly}
                  aria-label="Status flag options"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Payment Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  disabled={isReadOnly}
                  aria-label="Payment Date"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Settlement Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.settlementDate}
                  onChange={(e) => setFormData({ ...formData, settlementDate: e.target.value })}
                  disabled={isReadOnly}
                  aria-label="Settlement Date"
                />
              </div>
            </div>

            {/* Live calculation summaries */}
            <div style={{ padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "#f8fafc", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Outstanding (Before Payment):</span>
                <strong>₹{outstandingLimit.toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                <span>Net Received:</span>
                <strong>₹{netReceived.toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--primary)", fontWeight: "600" }}>
                <span>Remaining Outstanding (Post Payment):</span>
                <span>₹{postPaymentOutstanding.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "12px" }}>
              <label className="form-label">Payment Notes</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isReadOnly}
                aria-label="Payment notes"
              />
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCancelClose}>
              {isReadOnly ? "Close" : "Cancel"}
            </button>
            {!isReadOnly && (
              <button type="submit" className="btn btn-primary" disabled={submitting || !!formErrors.amountReceived} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {submitting ? "Saving..." : "Record Payment"}
              </button>
            )}
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={showConfirmCancel}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to close this payment form?"
        onConfirm={onClose}
        onCancel={() => setShowConfirmCancel(false)}
      />
    </div>
  );
}
