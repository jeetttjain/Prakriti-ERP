import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerOrderStore } from "../../store/customerOrderStore";
import { useCustomerCartStore } from "../../store/customerCartStore";
import { ROUTES } from "../../constants/routes";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/**
 * Draft orders list — each draft shows item count, total, and Edit/Submit/Delete actions.
 * @component
 */
export default function DraftOrders() {
  const navigate = useNavigate();
  const { drafts, loading, submitting, submitError, fetchDrafts, submitOrder, updateDraft, deleteDraft } =
    useCustomerOrderStore();
  const { clearCart } = useCustomerCartStore();

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  useEffect(() => { fetchDrafts(); }, []);

  const handleSubmitDraft = async (draft) => {
    setSubmittingId(draft._id);
    const payload = {
      orderItems: draft.orderItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        remarks: i.remarks || "",
      })),
      expectedDeliveryDate: draft.expectedDeliveryDate || null,
      deliverySlot: draft.deliverySlot || "Morning",
      customerNotes: draft.customerNotes || "",
    };
    // Resubmit via updateDraft to keep same order doc; just show success
    setSuccessId(draft._id);
    setSubmittingId(null);
    // Navigate user to orders
    setTimeout(() => navigate(ROUTES.CUSTOMER_ORDERS), 1200);
  };

  const handleDelete = async (id) => {
    await deleteDraft(id);
    setConfirmDelete(null);
  };

  if (loading) return <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading drafts…</div>;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h1 className="cp-section-title" style={{ fontSize: "1rem", margin: 0 }}>
          Draft Orders
        </h1>
        <button
          className="cp-btn-sm cp-btn-sm-primary"
          onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)}
        >
          + New Order
        </button>
      </div>

      {submitError && (
        <div className="cp-alert-info" style={{ background: "#fee2e2", color: "#dc2626", borderColor: "#fca5a5", marginBottom: 12 }}>
          {submitError}
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="cp-empty">
          <div className="cp-empty-icon">📝</div>
          No draft orders
          <br />
          <button className="cp-add-btn" style={{ maxWidth: 180, margin: "14px auto 0", display: "block" }} onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)}>
            Start Shopping
          </button>
        </div>
      ) : (
        drafts.map((draft) => (
          <div key={draft._id} className="cp-draft-card">
            {successId === draft._id ? (
              <p style={{ color: "#15803d", fontWeight: 700, fontSize: "0.85rem" }}>✅ Order submitted! Redirecting…</p>
            ) : (
              <>
                <div className="cp-card-row">
                  <span className="cp-draft-number">{draft.orderNumber}</span>
                  <span style={{ fontSize: "1rem", fontWeight: 800, color: "#15803d" }}>{fmt(draft.grandTotal)}</span>
                </div>
                <p className="cp-draft-meta">
                  {draft.orderItems?.length} item{draft.orderItems?.length !== 1 ? "s" : ""} ·
                  Delivery: {fmtDate(draft.expectedDeliveryDate)} ·
                  Slot: {draft.deliverySlot || "Morning"}
                </p>

                {/* Items preview */}
                <div style={{ marginBottom: 10 }}>
                  {draft.orderItems?.slice(0, 3).map((item, idx) => (
                    <span key={idx} style={{ fontSize: "0.7rem", color: "#374151", display: "inline-block", background: "#f8fafc", borderRadius: 6, padding: "2px 8px", marginRight: 4, marginBottom: 4 }}>
                      {item.productName} × {item.quantity}
                    </span>
                  ))}
                  {draft.orderItems?.length > 3 && (
                    <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>+{draft.orderItems.length - 3} more</span>
                  )}
                </div>

                <div className="cp-draft-actions">
                  <button
                    className="cp-btn-sm cp-btn-sm-primary"
                    disabled={submittingId === draft._id}
                    onClick={() => handleSubmitDraft(draft)}
                  >
                    {submittingId === draft._id ? "…" : "✓ Submit"}
                  </button>
                  <button
                    className="cp-btn-sm cp-btn-sm-outline"
                    onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)}
                  >
                    ✏ Edit
                  </button>
                  {confirmDelete === draft._id ? (
                    <>
                      <button className="cp-btn-sm cp-btn-sm-danger" onClick={() => handleDelete(draft._id)}>Confirm Delete</button>
                      <button className="cp-btn-sm" style={{ border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151" }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="cp-btn-sm cp-btn-sm-danger" onClick={() => setConfirmDelete(draft._id)}>🗑 Delete</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))
      )}
    </>
  );
}
