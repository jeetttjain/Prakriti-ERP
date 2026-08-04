import React, { useState, useEffect } from "react";
import { usePurchaseStore } from "../../store/purchaseStore";
import { useSettingsStore } from "../../store/settingsStore";
import * as supplierService from "../../services/supplierService";
import * as productService from "../../services/productService";

/**
 * Purchase Order Creation overlay modal.
 * Features duplicate item locks, field autofocus, and confirmation guards.
 * @component
 */
export default function PurchaseForm({ onClose }) {
  const { addPurchase } = usePurchaseStore();
  const isCategoryEnabled = useSettingsStore((state) => state.isCategoryEnabled);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [purchaseType, setPurchaseType] = useState("Regular");
  const [purchaseItems, setPurchaseItems] = useState([{ productId: "", quantity: 1, purchasePrice: 0 }]);
  const [discount, setDiscount] = useState("");
  const [transport, setTransport] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Retrieve initial catalogs
  useEffect(() => {
    supplierService.getSuppliers(1, 1000, "Active").then((res) => setSuppliers(res.data || []));
    productService.getProducts(1, 1000).then((res) => setProducts(res.data || []));
  }, []);

  // Compute subtotal and grandTotal dynamically
  const subtotal = purchaseItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.purchasePrice) || 0;
    return sum + qty * price;
  }, 0);

  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0) + (Number(transport) || 0));

  const handleItemProductSelect = (index, prodId) => {
    if (!prodId) return;

    // Duplicate product validation check
    const isDuplicate = purchaseItems.some((item, idx) => item.productId === prodId && idx !== index);
    if (isDuplicate) {
      setErrorMsg("This product has already been added to the purchase order items.");
      return;
    }
    setErrorMsg("");

    const prod = products.find((p) => p._id === prodId);
    const updated = [...purchaseItems];
    updated[index] = {
      ...updated[index],
      productId: prodId,
      purchasePrice: prod ? prod.purchasePrice || 0 : 0,
    };
    setPurchaseItems(updated);

    // Autofocus next quantity field
    setTimeout(() => {
      const qtyInput = document.getElementById(`qty-input-${index}`);
      if (qtyInput) {
        qtyInput.focus();
        qtyInput.select();
      }
    }, 80);
  };

  const handleItemFieldChange = (index, field, val) => {
    const updated = [...purchaseItems];
    updated[index] = { ...updated[index], [field]: val };
    setPurchaseItems(updated);
  };

  const handleAddItemRow = () => {
    setPurchaseItems([...purchaseItems, { productId: "", quantity: 1, purchasePrice: 0 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (purchaseItems.length === 1) return;
    setPurchaseItems(purchaseItems.filter((_, idx) => idx !== index));
  };

  const handleFormDismiss = () => {
    // Check if dirty before cancelling
    const isDirty = supplierId || expectedDelivery || purchaseItems.some((item) => item.productId) || notes;
    if (isDirty) {
      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
      if (!confirmDiscard) return;
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const invalidItems = purchaseItems.some((item) => !item.productId || Number(item.quantity) <= 0);
    if (invalidItems) {
      setErrorMsg("Please select valid products and positive quantities for all item rows.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addPurchase({
        supplierId,
        expectedDelivery,
        purchaseStatus: "Draft",
        purchaseType,
        purchaseItems,
        discount: Number(discount) || 0,
        transport: Number(transport) || 0,
        notes,
        createdBy: "Admin Console User",
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to create Purchase Order.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", width: "100%", maxWidth: "720px", maxHeight: "92vh", overflowY: "auto", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontWeight: "700" }}>Issue Purchase Replenishment Order</h3>
          <button type="button" onClick={handleFormDismiss} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: "14px", padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fee2e2", borderRadius: "6px", fontSize: "0.85rem" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label htmlFor="po-sup-select" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Supplier Partner *</label>
              <select id="po-sup-select" className="form-select" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }} required value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>{s.businessName} ({s.supplierCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="po-exp-delivery" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Expected Delivery *</label>
              <input id="po-exp-delivery" type="date" style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid var(--border-color)" }} required value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label htmlFor="po-type" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Purchase Classification</label>
              <select id="po-type" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }} value={purchaseType} onChange={(e) => setPurchaseType(e.target.value)}>
                {["Regular", "Emergency", "Return", "Direct Farm", "Internal Transfer"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PO Items List */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>Purchase Items List</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {purchaseItems.map((item, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1.5fr auto", gap: "8px", alignItems: "center" }}>
                  <select className="form-select" style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)", fontSize: "0.85rem" }} required value={item.productId} onChange={(e) => handleItemProductSelect(idx, e.target.value)}>
                    <option value="">-- Choose Product --</option>
                    {products.filter(p => isCategoryEnabled(p.category)).map((p) => (
                      <option key={p._id} value={p._id}>{p.productName} ({p.productCode})</option>
                    ))}
                  </select>
                  <input id={`qty-input-${idx}`} type="number" style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem", width: "100%" }} required min="0.01" step="any" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemFieldChange(idx, "quantity", e.target.value)} />
                  <input type="number" style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem", width: "100%" }} required min="0" step="any" placeholder="Price" value={item.purchasePrice} onChange={(e) => handleItemFieldChange(idx, "purchasePrice", e.target.value)} />
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", textAlign: "right", paddingRight: "8px" }}>
                    ₹{((Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0)).toFixed(2)}
                  </span>
                  <button type="button" className="btn btn-danger" style={{ padding: "8px 12px", border: "none" }} disabled={purchaseItems.length === 1} onClick={() => handleRemoveItemRow(idx)}>×</button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: "8px", padding: "4px 8px" }} onClick={handleAddItemRow}>+ Add Item Row</button>
          </div>

          {/* Financial calculations (Read-Only) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px dashed var(--border-color)" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "4px" }}>Items Subtotal (Read-only)</label>
              <input type="text" disabled style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "#e5e7eb", fontWeight: "600" }} value={`₹${subtotal.toFixed(2)}`} />
            </div>
            <div>
              <label htmlFor="po-discount" style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "4px" }}>Discount Amt</label>
              <input id="po-discount" type="number" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} min="0" placeholder="e.g. 50" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div>
              <label htmlFor="po-trans" style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "4px" }}>Transport / Logistics Charge</label>
              <input id="po-trans" type="number" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} min="0" placeholder="e.g. 100" value={transport} onChange={(e) => setTransport(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "4px" }}>Grand Total (Read-only)</label>
              <input type="text" disabled style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "#e5e7eb", fontWeight: "700", color: "var(--primary-color)" }} value={`₹${grandTotal.toFixed(2)}`} />
            </div>
          </div>

          <div>
            <label htmlFor="po-notes" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Order Notes</label>
            <textarea id="po-notes" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", minHeight: "60px" }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Replenishment notes or farm delivery guidelines..." />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
            <button type="button" className="btn btn-secondary" onClick={handleFormDismiss} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Issuing PO..." : "Issue Purchase Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
