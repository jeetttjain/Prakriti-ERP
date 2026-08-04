import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useOrderStore } from "../../store/orderStore";
import * as customerService from "../../services/customerService";
import * as productService from "../../services/productService";
import FormError from "../common/FormError";
import OrderItemsTable from "./OrderItemsTable";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Places new orders or modifies existing invoices inside modal overlay.
 * Handles snapshotted product pricing.
 * @component
 * @param {Object} props Props
 * @param {Object|null} props.order Order details if editing, null if creating
 * @param {Function} props.onClose Modal discard trigger
 * @param {Function} props.onSaved Save success callback
 */
export default function OrderForm({ order, onClose, onSaved }) {
  const { registerOrder, modifyOrder, error: storeError } = useOrderStore();
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    customerId: order?.customerId?._id || order?.customerId || "",
    branchId: order?.branchId || "",
    expectedDeliveryDate: order ? new Date(order.expectedDeliveryDate).toISOString().split("T")[0] : "",
    deliverySlot: order?.deliverySlot || "Morning",
    orderStatus: order?.orderStatus || "Draft",
    paymentStatus: order?.paymentStatus || "Pending",
    deliveryStatus: order?.deliveryStatus || "Pending",
    orderType: order?.orderType || "Manual",
    orderSource: order?.orderSource || "Admin",
    assignedVehicle: order?.assignedVehicle || "",
    assignedDriver: order?.assignedDriver || "",
    customerNotes: order?.customerNotes || "",
    adminNotes: order?.adminNotes || "",
    discount: order ? String(order.discount) : "0",
    discountType: order?.discountType || "Flat",
    transportCharge: order ? String(order.transportCharge) : "0",
    deliveryCharge: order ? String(order.deliveryCharge) : "0",
    orderItems: order?.orderItems || []
  });

  const [formErrors, setFormErrors] = useState({});

  // Retrieve active Customer and Product catalogs for dropdown selectors
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const custResult = await customerService.getCustomers(1, 200, "Active");
        const prodResult = await productService.getProducts(1, 200, "Active");
        const loadedProducts = prodResult.data || [];
        setCustomers(custResult.data || []);
        setProducts(loadedProducts);

        if (order && order.orderItems) {
          setFormData((prev) => ({
            ...prev,
            orderItems: prev.orderItems.map((item) => {
              const matched = loadedProducts.find(
                (p) => p._id === (item.productId?._id || item.productId)
              );
              return {
                ...item,
                currentStock: matched ? matched.currentStock : 0
              };
            })
          }));
        }
      } catch {
        // Load error
      }
    };
    loadCatalogs();
  }, [order]);

  const selectedCustomerDetails = useMemo(() => {
    return customers.find((c) => c._id === formData.customerId) || null;
  }, [customers, formData.customerId]);

  const branchesOptions = useMemo(() => {
    if (selectedCustomerDetails && selectedCustomerDetails.hasBranches) {
      return selectedCustomerDetails.branches || [];
    }
    return [];
  }, [selectedCustomerDetails]);

  const handleCustomerChange = (customerId) => {
    const selected = customers.find((c) => c._id === customerId);
    const branches = selected?.hasBranches ? (selected.branches || []) : [];
    setFormData((prev) => ({
      ...prev,
      customerId,
      branchId: branches.length > 0 ? branches[0]._id : ""
    }));
  };

  const subtotal = useMemo(() => {
    return formData.orderItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [formData.orderItems]);

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
    const val = subtotal - calculatedDiscount + transport + delivery;
    return Math.max(0, val);
  }, [subtotal, calculatedDiscount, formData.transportCharge, formData.deliveryCharge]);

  const hasUnsavedChanges = useMemo(() => {
    const initial = order ? {
      customerId: order.customerId?._id || order.customerId || "",
      branchId: order.branchId || "",
      expectedDeliveryDate: new Date(order.expectedDeliveryDate).toISOString().split("T")[0],
      deliverySlot: order.deliverySlot || "Morning",
      discount: String(order.discount || 0),
      discountType: order.discountType || "Flat",
      transportCharge: String(order.transportCharge || 0),
      deliveryCharge: String(order.deliveryCharge || 0),
      customerNotes: order.customerNotes || "",
      adminNotes: order.adminNotes || "",
      orderItems: order.orderItems || []
    } : {
      customerId: "",
      branchId: "",
      expectedDeliveryDate: "",
      deliverySlot: "Morning",
      discount: "0",
      discountType: "Flat",
      transportCharge: "0",
      deliveryCharge: "0",
      customerNotes: "",
      adminNotes: "",
      orderItems: []
    };

    return (
      formData.customerId !== initial.customerId ||
      formData.branchId !== initial.branchId ||
      formData.expectedDeliveryDate !== initial.expectedDeliveryDate ||
      formData.deliverySlot !== initial.deliverySlot ||
      formData.discount !== initial.discount ||
      formData.discountType !== initial.discountType ||
      formData.transportCharge !== initial.transportCharge ||
      formData.deliveryCharge !== initial.deliveryCharge ||
      formData.customerNotes.trim() !== initial.customerNotes.trim() ||
      formData.adminNotes.trim() !== initial.adminNotes.trim() ||
      JSON.stringify(formData.orderItems) !== JSON.stringify(initial.orderItems)
    );
  }, [formData, order]);

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
    if (!formData.customerId) {
      errors.customerId = "Customer is required.";
    }
    if (!formData.expectedDeliveryDate) {
      errors.expectedDeliveryDate = "Expected delivery date is required.";
    }
    if (formData.orderItems.length === 0) {
      errors.orderItems = "Order must contain at least one product.";
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateMainForm() || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        customerId: formData.customerId,
        branchId: formData.branchId || null,
        discount: Number(formData.discount),
        transportCharge: Number(formData.transportCharge),
        deliveryCharge: Number(formData.deliveryCharge)
      };

      if (order) {
        await modifyOrder(order._id, payload);
      } else {
        await registerOrder(payload);
      }
      onSaved();
    } catch {
      setSubmitting(false);
    }
  };

  const updateItemsList = useCallback((updatedItems) => {
    setFormData((prev) => ({ ...prev, orderItems: updatedItems }));
  }, []);

  return (
    <div className="modal-overlay" style={{ display: "flex", overflowY: "auto" }} onClick={handleOutsideClick} onKeyDown={handleTabKey}>
      <div ref={modalRef} className="modal-box" style={{ maxWidth: "750px", margin: "auto" }} tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
        <div className="modal-header">
          <h3 id="form-modal-title" className="modal-title">{order ? "Modify Order Records" : "Place wholesale Order"}</h3>
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
                <label className="form-label">Select B2B Customer *</label>
                <select
                  className="form-select"
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  required
                  disabled={!!order}
                  aria-label="Wholesale customer dropdown"
                >
                  <option value="">Select Customer option</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.businessName}
                    </option>
                  ))}
                </select>
                <FormError error={formErrors.customerId} />
              </div>

              <div className="form-group">
                <label className="form-label">Select Branch Outlet (Optional)</label>
                <select
                  className="form-select"
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  disabled={branchesOptions.length === 0 || !!order}
                  aria-label="Customer branch outlet selection"
                >
                  {branchesOptions.length === 0 ? (
                    <option value="">No branch networks registered</option>
                  ) : (
                    <>
                      <option value="">Select Branch</option>
                      {branchesOptions.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.branchName}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Expected Delivery Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  required
                  aria-label="Delivery Date selection"
                />
                <FormError error={formErrors.expectedDeliveryDate} />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Slot *</label>
                <select
                  className="form-select"
                  value={formData.deliverySlot}
                  onChange={(e) => setFormData({ ...formData, deliverySlot: e.target.value })}
                  aria-label="Delivery time slot selection"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>

            {/* Sub Items dynamic table editor */}
            <OrderItemsTable
              items={formData.orderItems}
              products={products}
              onChangeItems={updateItemsList}
            />
            <FormError error={formErrors.orderItems} />

            {/* Calculations and extra charges panel */}
            <div style={{ marginTop: "16px", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "#f8fafc" }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    aria-label="Discount value"
                  />
                  <FormError error={formErrors.discount} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select
                    className="form-select"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    aria-label="Discount calculation layout"
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
                    aria-label="Transport fee charge"
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
                    aria-label="Delivery dispatcher charge"
                  />
                  <FormError error={formErrors.deliveryCharge} />
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

            <div className="form-grid-2" style={{ marginTop: "12px" }}>
              <div className="form-group">
                <label className="form-label">Customer Notes (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={formData.customerNotes}
                  onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                  aria-label="Customer delivery instructions notes"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Admin Notes (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  aria-label="Admin internal processing notes"
                />
              </div>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCancelClose} aria-label="Cancel modifications">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} aria-label="Save order details" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {submitting ? (
                <>
                  <span className="button-spinner-icon"></span>
                  <span>Saving...</span>
                </>
              ) : (
                "Save Order"
              )}
            </button>
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
