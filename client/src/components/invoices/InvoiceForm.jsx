import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useInvoiceStore } from "../../store/invoiceStore";
import * as orderService from "../../services/orderService";
import FormError from "../common/FormError";
import InvoiceItemsTable from "./InvoiceItemsTable";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Creates new invoices from existing wholesale orders or displays locked issued invoice records.
 * @component
 * @param {Object} props Props
 * @param {Object|null} props.invoice Invoice details if editing/viewing, null if creating
 * @param {Function} props.onClose Modal discard trigger
 * @param {Function} props.onSaved Save success callback
 */
export default function InvoiceForm({ invoice, onClose, onSaved }) {
  const { registerInvoice, modifyInvoice, error: storeError } = useInvoiceStore();
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const [orders, setOrders] = useState([]);
  const modalRef = useRef(null);

  const isReadOnly = useMemo(() => {
    if (!invoice) return false;
    return invoice.invoiceStatus === "Issued" || invoice.isLocked;
  }, [invoice]);

  const [formData, setFormData] = useState({
    orderId: invoice?.orderId?._id || invoice?.orderId || "",
    customerId: invoice?.customerId?._id || invoice?.customerId || "",
    dueDate: invoice ? new Date(invoice.dueDate).toISOString().split("T")[0] : "",
    invoiceDate: invoice ? new Date(invoice.invoiceDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    invoiceStatus: invoice?.invoiceStatus || "Draft",
    paymentStatus: invoice?.paymentStatus || "Pending",
    invoiceType: invoice?.invoiceType || "Sale",
    invoiceSource: invoice?.invoiceSource || "Order",
    currency: invoice?.currency || "INR",
    exchangeRate: invoice ? String(invoice.exchangeRate) : "1",
    discount: invoice ? String(invoice.discount) : "0",
    discountType: invoice?.discountType || "Flat",
    transportCharge: invoice ? String(invoice.transportCharge) : "0",
    deliveryCharge: invoice ? String(invoice.deliveryCharge) : "0",
    taxAmount: invoice ? String(invoice.taxAmount) : "0",
    notes: invoice?.notes || "",
    invoiceItems: invoice?.invoiceItems || []
  });

  const [formErrors, setFormErrors] = useState({});

  // Retrieve active eligible orders list on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const result = await orderService.getOrders(1, 150);
        // Only allow orders that are not fully invoiced, or match the current active order ID in Edit mode
        const eligible = (result.data || []).filter(
          (o) => o.invoiceStatus !== "Fully Invoiced" || o._id === formData.orderId
        );
        setOrders(eligible);
      } catch {
        // Load error
      }
    };
    loadOrders();
  }, [formData.orderId]);

  const selectedOrderDetails = useMemo(() => {
    return orders.find((o) => o._id === formData.orderId) || null;
  }, [orders, formData.orderId]);

  // Autofill fields when an order is selected (Create Mode only)
  const handleOrderChange = (orderId) => {
    const orderObj = orders.find((o) => o._id === orderId);
    if (!orderObj) {
      setFormData((prev) => ({
        ...prev,
        orderId: "",
        customerId: "",
        discount: "0",
        discountType: "Flat",
        transportCharge: "0",
        deliveryCharge: "0",
        invoiceItems: []
      }));
      return;
    }

    const mappedItems = (orderObj.orderItems || []).map((item) => ({
      productId: item.productId?._id || item.productId,
      orderItemId: item._id, // Crucial orderItem link reference
      productCode: item.productCode,
      productName: item.productName,
      displayNameSnapshot: item.productName,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      purchasePriceSnapshot: item.purchasePriceSnapshot,
      sellingPriceSnapshot: item.sellingPriceSnapshot,
      taxSnapshot: 0,
      amount: item.amount,
      remarks: item.remarks || ""
    }));

    setFormData((prev) => ({
      ...prev,
      orderId,
      customerId: orderObj.customerId?._id || orderObj.customerId,
      discount: String(orderObj.discount || 0),
      discountType: orderObj.discountType || "Flat",
      transportCharge: String(orderObj.transportCharge || 0),
      deliveryCharge: String(orderObj.deliveryCharge || 0),
      invoiceItems: mappedItems
    }));
  };

  const subtotal = useMemo(() => {
    return formData.invoiceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [formData.invoiceItems]);

  const calculatedDiscount = useMemo(() => {
    const numDiscount = Number(formData.discount) || 0;
    if (formData.discountType === "Percentage") {
      return subtotal * (numDiscount / 100);
    }
    return numDiscount;
  }, [subtotal, formData.discount, formData.discountType]);

  const grandTotal = useMemo(() => {
    const transport = Number(formData.transportCharge) || 0;
    const delivery = Number(formData.deliveryCharge) || 0;
    const tax = Number(formData.taxAmount) || 0;
    const val = subtotal - calculatedDiscount + transport + delivery + tax;
    return Math.max(0, val);
  }, [subtotal, calculatedDiscount, formData.transportCharge, formData.deliveryCharge, formData.taxAmount]);

  const hasUnsavedChanges = useMemo(() => {
    if (isReadOnly) return false;
    const initial = invoice ? {
      orderId: invoice.orderId?._id || invoice.orderId || "",
      dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
      invoiceDate: new Date(invoice.invoiceDate).toISOString().split("T")[0],
      discount: String(invoice.discount || 0),
      discountType: invoice.discountType || "Flat",
      transportCharge: String(invoice.transportCharge || 0),
      deliveryCharge: String(invoice.deliveryCharge || 0),
      taxAmount: String(invoice.taxAmount || 0),
      notes: invoice.notes || "",
      invoiceItems: invoice.invoiceItems || []
    } : {
      orderId: "",
      dueDate: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      discount: "0",
      discountType: "Flat",
      transportCharge: "0",
      deliveryCharge: "0",
      taxAmount: "0",
      notes: "",
      invoiceItems: []
    };

    return (
      formData.orderId !== initial.orderId ||
      formData.dueDate !== initial.dueDate ||
      formData.invoiceDate !== initial.invoiceDate ||
      formData.discount !== initial.discount ||
      formData.discountType !== initial.discountType ||
      formData.transportCharge !== initial.transportCharge ||
      formData.deliveryCharge !== initial.deliveryCharge ||
      formData.taxAmount !== initial.taxAmount ||
      formData.notes.trim() !== initial.notes.trim() ||
      JSON.stringify(formData.invoiceItems) !== JSON.stringify(initial.invoiceItems)
    );
  }, [formData, invoice, isReadOnly]);

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
    if (!formData.orderId) {
      errors.orderId = "Order is required.";
    }
    if (!formData.dueDate) {
      errors.dueDate = "Due date is required.";
    }
    if (formData.invoiceItems.length === 0) {
      errors.invoiceItems = "Invoice must contain at least one item.";
    }
    if (isNaN(Number(formData.discount)) || Number(formData.discount) < 0) {
      errors.discount = "Discount value must be non-negative.";
    }
    if (isNaN(Number(formData.transportCharge)) || Number(formData.transportCharge) < 0) {
      errors.transportCharge = "Transport charge value must be non-negative.";
    }
    if (isNaN(Number(formData.deliveryCharge)) || Number(formData.deliveryCharge) < 0) {
      errors.deliveryCharge = "Delivery charge value must be non-negative.";
    }
    if (isNaN(Number(formData.taxAmount)) || Number(formData.taxAmount) < 0) {
      errors.taxAmount = "Tax amount value must be non-negative.";
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
        discount: Number(formData.discount),
        transportCharge: Number(formData.transportCharge),
        deliveryCharge: Number(formData.deliveryCharge),
        taxAmount: Number(formData.taxAmount),
        grandTotal // Enforce calculated total validation
      };

      if (invoice) {
        await modifyInvoice(invoice._id, payload);
      } else {
        await registerInvoice(payload);
      }
      onSaved();
    } catch {
      setSubmitting(false);
    }
  };



  const handleInvoiceItemsChange = useCallback((updatedItems) => {
    setFormData((prev) => ({ ...prev, invoiceItems: updatedItems }));
  }, []);

  return (
    <div className="modal-overlay" style={{ display: "flex", overflowY: "auto" }} onClick={handleOutsideClick} onKeyDown={handleTabKey}>
      <div ref={modalRef} className="modal-box" style={{ maxWidth: "750px", margin: "auto" }} tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
        <div className="modal-header">
          <h3 id="form-modal-title" className="modal-title">
            {isReadOnly ? "View Issued Invoice Details" : invoice ? "Modify Draft Invoice" : "Generate Billing Invoice"}
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

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Select Order Reference *</label>
                <select
                  className="form-select"
                  value={formData.orderId}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  required
                  disabled={!!invoice}
                  aria-label="Order reference dropdown"
                >
                  <option value="">Select Order option</option>
                  {orders.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.orderNumber} ({o.customerSnapshot?.businessName || "Details"})
                    </option>
                  ))}
                </select>
                <FormError error={formErrors.orderId} />
              </div>

              <div className="form-group">
                <label className="form-label">Billing Customer (Autofilled)</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedOrderDetails?.customerSnapshot?.businessName || invoice?.customerSnapshot?.businessName || ""}
                  disabled
                  placeholder="No customer mapped"
                  aria-label="Autofilled B2B customer"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Invoice Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  required
                  disabled={isReadOnly}
                  aria-label="Invoice Date"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  disabled={isReadOnly}
                  aria-label="Due Date"
                />
                <FormError error={formErrors.dueDate} />
              </div>
            </div>

            {/* Invoiced items list table */}
            <InvoiceItemsTable
              items={formData.invoiceItems}
              isReadOnly={isReadOnly}
              onChangeItems={handleInvoiceItemsChange}
            />
            <FormError error={formErrors.invoiceItems} />

            {/* Pricing details card summary */}
            <div style={{ marginTop: "16px", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "#f8fafc" }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    disabled={isReadOnly}
                    aria-label="Discount amount"
                  />
                  <FormError error={formErrors.discount} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select
                    className="form-select"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    disabled={isReadOnly}
                    aria-label="Discount style selector"
                  >
                    <option value="Flat">Flat Amount (₹)</option>
                    <option value="Percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2" style={{ marginTop: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Transport Charge (₹)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.transportCharge}
                    onChange={(e) => setFormData({ ...formData, transportCharge: e.target.value })}
                    disabled={isReadOnly}
                    aria-label="Transport fee"
                  />
                  <FormError error={formErrors.transportCharge} />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Charge (₹)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.deliveryCharge}
                    onChange={(e) => setFormData({ ...formData, deliveryCharge: e.target.value })}
                    disabled={isReadOnly}
                    aria-label="Delivery dispatch fee"
                  />
                  <FormError error={formErrors.deliveryCharge} />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginTop: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Tax Amount (GST) (₹)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                    disabled={isReadOnly}
                    aria-label="Tax amount"
                  />
                  <FormError error={formErrors.taxAmount} />
                </div>
                <div className="form-group">
                  <label className="form-label">Invoice status</label>
                  <select
                    className="form-select"
                    value={formData.invoiceStatus}
                    onChange={(e) => setFormData({ ...formData, invoiceStatus: e.target.value })}
                    disabled={isReadOnly}
                    aria-label="Invoice status picker"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Issued">Issued (Lock details)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "12px", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Subtotal Amount:</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#b91c1c" }}>
                  <span>Discounts Applied:</span>
                  <strong>- ₹{calculatedDiscount.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--primary)", fontSize: "1.1rem", fontWeight: "700" }}>
                  <span>Grand Total Amount:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "12px" }}>
              <label className="form-label">Billing Notes (Optional)</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isReadOnly}
                aria-label="Invoice descriptions"
              />
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCancelClose} aria-label="Cancel modifications">
              {isReadOnly ? "Close" : "Cancel"}
            </button>
            {!isReadOnly && (
              <button type="submit" className="btn btn-primary" disabled={submitting} aria-label="Save invoice details" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {submitting ? (
                  <>
                    <span className="button-spinner-icon"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Invoice"
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={showConfirmCancel}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to close the form and lose your entered data?"
        onConfirm={onClose}
        onCancel={() => setShowConfirmCancel(false)}
      />
    </div>
  );
}
