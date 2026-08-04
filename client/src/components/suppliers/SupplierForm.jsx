import React, { useState } from "react";
import { useSupplierStore } from "../../store/supplierStore";

/**
 * Overlay modal form for registering or modifying supplier partners.
 * @component
 * @param {Object} props
 * @param {Object} [props.supplier] Active supplier record to edit (null for creation)
 * @param {Function} props.onClose Modal dismiss trigger
 */
export default function SupplierForm({ supplier = null, onClose }) {
  const { addSupplier, modifySupplier } = useSupplierStore();
  const [businessName, setBusinessName] = useState(supplier?.businessName || "");
  const [personName, setPersonName] = useState(supplier?.personName || "");
  const [mobile, setMobile] = useState(supplier?.mobile || "");
  const [gst, setGst] = useState(supplier?.gst || "");
  const [address, setAddress] = useState(supplier?.address || "");
  const [status, setStatus] = useState(supplier?.status || "Active");
  const [category, setCategory] = useState(supplier?.supplierCategory || "Wholesaler");
  const [rating, setRating] = useState(supplier?.supplierRating || 5);
  const [paymentTerms, setPaymentTerms] = useState(supplier?.paymentTerms || "");
  const [notes, setNotes] = useState(supplier?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessName || !personName || !mobile) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    const payload = {
      businessName,
      personName,
      mobile,
      gst,
      address,
      status,
      supplierCategory: category,
      supplierRating: Number(rating),
      paymentTerms,
      notes,
    };

    setIsSaving(true);
    setErrorMsg("");
    try {
      if (supplier) {
        await modifySupplier(supplier._id, payload);
      } else {
        await addSupplier(payload);
      }
      setIsSaving(false);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save supplier partner details.");
      setIsSaving(false);
    }
  };

  const categories = ["Farmer", "Wholesaler", "Distributor", "Manufacturer"];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontWeight: "700" }}>
            {supplier ? "Edit Supplier Partner" : "Register Supplier Partner"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}
          >
            ×
          </button>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: "16px", padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fee2e2", borderRadius: "6px", fontSize: "0.85rem" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label htmlFor="sup-biz-name" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Business Name *</label>
            <input
              id="sup-biz-name"
              type="text"
              className="form-input"
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Green Farms Ltd"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label htmlFor="sup-person-name" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Contact Person *</label>
              <input
                id="sup-person-name"
                type="text"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Contact name"
              />
            </div>
            <div>
              <label htmlFor="sup-mobile" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Mobile Number *</label>
              <input
                id="sup-mobile"
                type="tel"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label htmlFor="sup-gst" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>GSTIN (Optional)</label>
              <input
                id="sup-gst"
                type="text"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                placeholder="GST registration code"
              />
            </div>
            <div>
              <label htmlFor="sup-status" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Active Status</label>
              <select
                id="sup-status"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label htmlFor="sup-cat" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Category</label>
              <select
                id="sup-cat"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sup-rating" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Supplier Rating</label>
              <select
                id="sup-rating"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {"★".repeat(r)} ({r}/5)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="sup-address" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Address</label>
            <input
              id="sup-address"
              type="text"
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Supplier warehouse street address"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
            <div>
              <label htmlFor="sup-terms" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Payment Terms</label>
              <input
                id="sup-terms"
                type="text"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. Net 30, COD"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sup-notes" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Internal Notes</label>
            <textarea
              id="sup-notes"
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", minHeight: "60px" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Procurement details, delivery notes..."
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
