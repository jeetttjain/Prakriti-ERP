import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useProductStore } from "../../store/productStore";
import { useSettingsStore } from "../../store/settingsStore";
import FormError from "../common/FormError";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Registers new products or modifies existing catalog items in database.
 * @component
 * @param {Object} props Props
 * @param {Object|null} props.product Product data if editing, null if creating
 * @param {Function} props.onClose Modal discard trigger
 * @param {Function} props.onSaved Save success callback
 */
export default function ProductForm({ product, onClose, onSaved }) {
  const { registerProduct, modifyProduct, error: storeError } = useProductStore();
  const isCategoryEnabled = useSettingsStore((state) => state.isCategoryEnabled);

  const categoriesList = useMemo(() => {
    const list = [];
    if (isCategoryEnabled("Vegetable")) list.push("Vegetable");
    if (isCategoryEnabled("Fruit")) list.push("Fruit");
    if (isCategoryEnabled("Dairy")) list.push("Dairy");
    if (isCategoryEnabled("Grocery")) list.push("Grocery");
    if (isCategoryEnabled("Beverages")) list.push("Beverages");
    if (isCategoryEnabled("Packaging")) list.push("Packaging");
    if (list.length === 0) list.push("Vegetable"); // Fallback
    return list;
  }, [isCategoryEnabled]);

  const [submitting, setSubmitting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    productName: product?.productName || "",
    category: product?.category || categoriesList[0],
    unit: product?.unit || "Kg",
    purchasePrice: product ? String(product.purchasePrice) : "0",
    sellingPrice: product ? String(product.sellingPrice) : "0",
    currentStock: product ? String(product.currentStock) : "0",
    minimumStock: product ? String(product.minimumStock) : "0",
    displayOrder: product ? String(product.displayOrder) : "0",
    priority: product?.priority || "Normal",
    status: product?.status || "Active",
    notes: product?.notes || ""
  });

  const [formErrors, setFormErrors] = useState({});

  const hasUnsavedChanges = useMemo(() => {
    const initial = product ? {
      productName: product.productName || "",
      category: product.category || "Vegetable",
      unit: product.unit || "Kg",
      purchasePrice: String(product.purchasePrice || 0),
      sellingPrice: String(product.sellingPrice || 0),
      currentStock: String(product.currentStock || 0),
      minimumStock: String(product.minimumStock || 0),
      displayOrder: String(product.displayOrder || 0),
      priority: product.priority || "Normal",
      status: product.status || "Active",
      notes: product.notes || ""
    } : {
      productName: "",
      category: "Vegetable",
      unit: "Kg",
      purchasePrice: "0",
      sellingPrice: "0",
      currentStock: "0",
      minimumStock: "0",
      displayOrder: "0",
      priority: "Normal",
      status: "Active",
      notes: ""
    };

    return (
      formData.productName.trim() !== initial.productName.trim() ||
      formData.category !== initial.category ||
      formData.unit !== initial.unit ||
      Number(formData.purchasePrice) !== Number(initial.purchasePrice) ||
      Number(formData.sellingPrice) !== Number(initial.sellingPrice) ||
      Number(formData.currentStock) !== Number(initial.currentStock) ||
      Number(formData.minimumStock) !== Number(initial.minimumStock) ||
      Number(formData.displayOrder) !== Number(initial.displayOrder) ||
      formData.priority !== initial.priority ||
      formData.status !== initial.status ||
      formData.notes.trim() !== initial.notes.trim()
    );
  }, [formData, product]);

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

  const cleanString = (str) => {
    return str.trim().replace(/\s+/g, " ");
  };

  const validateMainForm = () => {
    const errors = {};
    const cleanName = cleanString(formData.productName);

    if (cleanName.length < 2) {
      errors.productName = "Product name must be at least 2 characters.";
    }

    if (isNaN(Number(formData.purchasePrice)) || Number(formData.purchasePrice) < 0) {
      errors.purchasePrice = "Purchase price must be a non-negative number.";
    }

    if (isNaN(Number(formData.sellingPrice)) || Number(formData.sellingPrice) < 0) {
      errors.sellingPrice = "Selling price must be a non-negative number.";
    }

    if (isNaN(Number(formData.currentStock)) || Number(formData.currentStock) < 0) {
      errors.currentStock = "Current stock must be a non-negative number.";
    }

    if (isNaN(Number(formData.minimumStock)) || Number(formData.minimumStock) < 0) {
      errors.minimumStock = "Minimum stock must be a non-negative number.";
    }

    if (isNaN(Number(formData.displayOrder)) || !Number.isInteger(Number(formData.displayOrder))) {
      errors.displayOrder = "Display order must be an integer.";
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
        productName: cleanString(formData.productName),
        category: formData.category,
        unit: formData.unit,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        currentStock: Number(formData.currentStock),
        minimumStock: Number(formData.minimumStock),
        displayOrder: Number(formData.displayOrder),
        priority: formData.priority,
        status: formData.status,
        notes: formData.notes.trim()
      };

      if (product) {
        await modifyProduct(product._id, payload);
      } else {
        await registerProduct(payload);
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
          <h3 id="form-modal-title" className="modal-title">{product ? "Modify Product Details" : "Register Catalog Product"}</h3>
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
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
                aria-label="Product name"
              />
              <FormError error={formErrors.productName} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  aria-label="Product Category"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit of Measurement *</label>
                <select
                  className="form-select"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  aria-label="Unit of Measurement"
                >
                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Piece">Piece</option>
                  <option value="Bundle">Bundle</option>
                  <option value="Packet">Packet</option>
                  <option value="Box">Box</option>
                  <option value="Crate">Crate</option>
                  <option value="Litre">Litre</option>
                  <option value="Dozen">Dozen</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Purchase Price (₹) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  required
                  aria-label="Purchase price value"
                />
                <FormError error={formErrors.purchasePrice} />
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price (₹) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  required
                  aria-label="Selling price value"
                />
                <FormError error={formErrors.sellingPrice} />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Current Stock *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  required
                  aria-label="Current stock level"
                />
                <FormError error={formErrors.currentStock} />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Stock *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                  required
                  aria-label="Minimum stock warning level"
                />
                <FormError error={formErrors.minimumStock} />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  step={1}
                  className="form-input"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  aria-label="Display order on catalog portal"
                />
                <FormError error={formErrors.displayOrder} />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  aria-label="Priority ranking level"
                >
                  <option value="Normal">Normal</option>
                  <option value="Popular">Popular</option>
                  <option value="Featured">Featured</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                aria-label="Catalog status option"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                aria-label="Internal description notes"
              />
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
                "Save Product"
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
