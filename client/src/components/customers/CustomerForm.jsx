import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCustomerStore } from "../../store/customerStore";
import { DEFAULT_PAYMENT_CYCLE, DEFAULT_CREDIT_LIMIT } from "../../constants/paymentCycle";
import FormError from "../common/FormError";
import CustomerBranchSection from "./CustomerBranchSection";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Registers new customers or modifies existing profiles in the database.
 * Supports separate Contact Number and WhatsApp Number.
 * @component
 * @param {Object} props Props
 * @param {Object|null} props.customer Customer data if editing, null if creating
 * @param {Function} props.onClose Modal discard trigger
 * @param {Function} props.onSaved Save success callback
 */


export default function CustomerForm({ customer, onClose, onSaved }) {
  const { registerCustomer, modifyCustomer, error: storeError } = useCustomerStore();
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [isSameNumber, setIsSameNumber] = useState(() => {
    if (!customer) return true;
    const initialContact = customer.contactNumber || customer.mobile || "";
    const initialWhatsapp = customer.whatsappNumber || customer.mobile || "";
    return initialContact === initialWhatsapp;
  });

  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    businessName: customer?.businessName || "",
    personName: customer?.personName || "",
    contactNumber: customer?.contactNumber || customer?.mobile || "",
    whatsappNumber: customer?.whatsappNumber || customer?.mobile || "",
    mobile: customer?.mobile || "", // legacy compatibility
    address: customer?.address || "",
    paymentCycle: customer?.paymentCycle || DEFAULT_PAYMENT_CYCLE,
    creditLimit: customer?.creditLimit || DEFAULT_CREDIT_LIMIT,
    gstNumber: customer?.gstNumber || "",
    notes: customer?.notes || "",
    hasBranches: customer?.hasBranches || false,
    branches: customer?.branches || []
  });

  const [formErrors, setFormErrors] = useState({});

  const hasUnsavedChanges = useMemo(() => {
    const initial = customer ? {
      businessName: customer.businessName || "",
      personName: customer.personName || "",
      contactNumber: customer.contactNumber || customer.mobile || "",
      whatsappNumber: customer.whatsappNumber || customer.mobile || "",
      address: customer.address || "",
      paymentCycle: customer.paymentCycle || DEFAULT_PAYMENT_CYCLE,
      creditLimit: customer.creditLimit || DEFAULT_CREDIT_LIMIT,
      gstNumber: customer.gstNumber || "",
      notes: customer.notes || "",
      hasBranches: customer.hasBranches || false,
      branches: customer.branches || []
    } : {
      businessName: "",
      personName: "",
      contactNumber: "",
      whatsappNumber: "",
      address: "",
      paymentCycle: DEFAULT_PAYMENT_CYCLE,
      creditLimit: DEFAULT_CREDIT_LIMIT,
      gstNumber: "",
      notes: "",
      hasBranches: false,
      branches: []
    };

    return (
      formData.businessName.trim() !== initial.businessName.trim() ||
      formData.personName.trim() !== initial.personName.trim() ||
      formData.contactNumber.trim() !== initial.contactNumber.trim() ||
      formData.whatsappNumber.trim() !== initial.whatsappNumber.trim() ||
      formData.address.trim() !== initial.address.trim() ||
      Number(formData.paymentCycle) !== Number(initial.paymentCycle) ||
      Number(formData.creditLimit) !== Number(initial.creditLimit) ||
      formData.gstNumber.trim() !== initial.gstNumber.trim() ||
      formData.notes.trim() !== initial.notes.trim() ||
      formData.hasBranches !== initial.hasBranches ||
      JSON.stringify(formData.branches) !== JSON.stringify(initial.branches)
    );
  }, [formData, customer]);

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

  const handleContactInput = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      contactNumber: val,
      whatsappNumber: isSameNumber ? val : prev.whatsappNumber
    }));
  };

  const handleWhatsappInput = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, whatsappNumber: val }));
  };

  const handleContactPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const val = paste.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      contactNumber: val,
      whatsappNumber: isSameNumber ? val : prev.whatsappNumber
    }));
  };

  const handleWhatsappPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const val = paste.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, whatsappNumber: val }));
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsSameNumber(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, whatsappNumber: prev.contactNumber }));
    }
  };

  const cleanString = (str) => {
    return str.trim().replace(/\s+/g, " ");
  };

  const validateMainForm = () => {
    const errors = {};
    const cleanBusiness = cleanString(formData.businessName);
    const cleanPerson = cleanString(formData.personName);

    if (cleanBusiness.length < 3) {
      errors.businessName = "Business name must be at least 3 characters.";
    }
    if (cleanPerson.length < 2) {
      errors.personName = "Contact person name must be at least 2 characters.";
    }
    if (!formData.contactNumber || !/^[0-9]{10}$/.test(formData.contactNumber)) {
      errors.contactNumber = "Please enter a valid 10-digit contact number.";
    }
    if (!formData.whatsappNumber || !/^[0-9]{10}$/.test(formData.whatsappNumber)) {
      errors.whatsappNumber = "Please enter a valid 10-digit WhatsApp number.";
    }
    if (!formData.address || formData.address.trim() === "") {
      errors.address = "Address is required.";
    }
    if (Number(formData.creditLimit) < 0 || !Number.isInteger(Number(formData.creditLimit))) {
      errors.creditLimit = "Credit limit must be a positive integer.";
    }
    if (formData.gstNumber.trim() !== "") {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gstNumber.trim())) {
        errors.gstNumber = "Please enter a valid GST format (e.g. 07AAAAA1111A1Z1).";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateMainForm() || submitting) return;

    setSubmitting(true);
    try {
      const sanitizedBranches = formData.branches.map((b) => {
        const { _id, ...rest } = b;
        return _id && _id.startsWith("temp_") ? rest : b;
      });

      const payload = {
        ...formData,
        businessName: cleanString(formData.businessName),
        personName: cleanString(formData.personName),
        address: formData.address.trim(),
        mobile: formData.contactNumber, // satisfy unique Mongoose mobile field
        gstNumber: formData.gstNumber.trim().toUpperCase(),
        notes: formData.notes.trim(),
        branches: sanitizedBranches
      };

      if (customer) {
        await modifyCustomer(customer._id, payload);
      } else {
        await registerCustomer(payload);
      }
      onSaved();
    } catch {
      setSubmitting(false);
    }
  };

  const updateBranchesList = useCallback((updatedBranches) => {
    setFormData((prev) => ({ ...prev, branches: updatedBranches }));
  }, []);


  return (
    <div className="modal-overlay" style={{ display: "flex", overflowY: "auto" }} onClick={handleOutsideClick} onKeyDown={handleTabKey}>
      <div ref={modalRef} className="modal-box" style={{ maxWidth: "600px", margin: "auto" }} tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
        <div className="modal-header">
          <h3 id="form-modal-title" className="modal-title">{customer ? "Modify Customer Details" : "Register B2B Customer"}</h3>
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
              <label className="form-label">Business Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
                aria-label="Business Name"
              />
              <FormError error={formErrors.businessName} />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person *</label>
              <input
                type="text"
                className="form-input"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                required
                aria-label="Contact Person Name"
              />
              <FormError error={formErrors.personName} />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <input
                type="text"
                maxLength={10}
                className="form-input"
                value={formData.contactNumber}
                onChange={handleContactInput}
                onPaste={handleContactPaste}
                inputMode="numeric"
                required
                aria-label="10-digit calling contact number"
              />
              <FormError error={formErrors.contactNumber} />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Number *</label>
              <input
                type="text"
                maxLength={10}
                className="form-input"
                value={formData.whatsappNumber}
                onChange={handleWhatsappInput}
                onPaste={handleWhatsappPaste}
                disabled={isSameNumber}
                inputMode="numeric"
                required
                aria-label="10-digit WhatsApp messaging number"
              />
              <FormError error={formErrors.whatsappNumber} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <input
                type="checkbox"
                id="chk-same-number"
                checked={isSameNumber}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="chk-same-number" style={{ fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                Same as Contact Number
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Address *</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                aria-label="Physical Billing Address"
              />
              <FormError error={formErrors.address} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Payment Cycle</label>
                <select
                  className="form-select"
                  value={formData.paymentCycle}
                  onChange={(e) => setFormData({ ...formData, paymentCycle: Number(e.target.value) })}
                  aria-label="Payment Cycle Terms"
                >
                  <option value={15}>15 Days Terms</option>
                  <option value={30}>30 Days Terms</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Credit Limit (₹)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="form-input"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  aria-label="Credit Limit value"
                />
                <FormError error={formErrors.creditLimit} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">GST Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                aria-label="GST Identification Number"
              />
              <FormError error={formErrors.gstNumber} />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                aria-label="Internal Notes details"
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <input
                  type="checkbox"
                  id="chk-has-branches"
                  checked={formData.hasBranches}
                  onChange={(e) => setFormData({ ...formData, hasBranches: e.target.checked })}
                />
                <label htmlFor="chk-has-branches" style={{ fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>Manage Multi-Branch Outlets</label>
              </div>

              {formData.hasBranches && (
                <CustomerBranchSection
                  branches={formData.branches}
                  mainMobile={formData.contactNumber}
                  onChangeBranches={updateBranchesList}
                />
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCancelClose} aria-label="Cancel modifications">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} aria-label="Save profile details" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {submitting ? (
                <>
                  <span className="button-spinner-icon"></span>
                  <span>Saving...</span>
                </>
              ) : (
                "Save Customer"
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
