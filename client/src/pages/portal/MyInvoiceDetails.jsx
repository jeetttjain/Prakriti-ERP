import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerPortalStore } from "../../store/customerPortalStore";
import { ROUTES } from "../../constants/routes";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/**
 * Customer portal invoice detail page.
 * @component
 */
export default function MyInvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoiceDetails, fetchInvoiceDetails, loading } = useCustomerPortalStore();

  useEffect(() => { if (id) fetchInvoiceDetails(id); }, [id]);

  const inv = invoiceDetails;

  if (loading) return <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading...</div>;
  if (!inv) return <div className="cp-empty"><div className="cp-empty-icon">❌</div>Invoice not found.</div>;

  const ps = inv.paymentSummary || {};

  return (
    <>
      <button
        onClick={() => navigate(ROUTES.CUSTOMER_INVOICES)}
        style={{ background: "none", border: "none", color: "#15803d", cursor: "pointer", marginBottom: 12, fontWeight: 600, fontSize: "0.85rem" }}
      >
        ← Back to Invoices
      </button>

      {/* Header */}
      <div className="cp-card" style={{ marginBottom: 12 }}>
        <div className="cp-card-row">
          <span className="cp-card-number">{inv.invoiceNumber}</span>
          <span className={`cp-badge ${inv.invoiceStatus === "Paid" ? "cp-badge-success" : inv.invoiceStatus === "Cancelled" ? "cp-badge-danger" : "cp-badge-warning"}`}>
            {inv.invoiceStatus}
          </span>
        </div>
        <div className="cp-card-row" style={{ marginTop: 8 }}>
          <span className="cp-card-label">Invoice Date</span>
          <span className="cp-card-value">{fmtDate(inv.invoiceDate)}</span>
        </div>
        <div className="cp-card-row" style={{ marginTop: 4 }}>
          <span className="cp-card-label">Due Date</span>
          <span className="cp-card-value" style={{ color: ps.outstandingAmount > 0 ? "#dc2626" : undefined }}>
            {fmtDate(inv.dueDate)}
          </span>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="cp-card" style={{ marginBottom: 12 }}>
        <p className="cp-section-title" style={{ marginBottom: 10 }}>Payment Summary</p>
        {[
          ["Invoice Total", fmt(inv.grandTotal)],
          ["Amount Paid", fmt(ps.paidAmount)],
          ["Pending Amount", fmt(ps.pendingAmount)],
          ["Outstanding", fmt(ps.outstandingAmount)],
        ].map(([k, v]) => (
          <div className="cp-card-row" key={k} style={{ marginBottom: 6 }}>
            <span className="cp-card-label">{k}</span>
            <span className="cp-card-value" style={k === "Outstanding" && ps.outstandingAmount > 0 ? { color: "#dc2626" } : {}}>
              {v}
            </span>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="cp-card">
        <p className="cp-section-title" style={{ marginBottom: 10 }}>Items</p>
        {inv.items?.map((item, idx) => (
          <div key={idx} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 10, marginBottom: 10 }}>
            <div className="cp-card-row">
              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>{item.productName}</span>
              <span className="cp-card-value">{fmt(item.totalAmount)}</span>
            </div>
            <div className="cp-card-row" style={{ marginTop: 4 }}>
              <span className="cp-card-label">{item.quantity} {item.unit} × {fmt(item.unitPrice)}</span>
            </div>
          </div>
        ))}
        <div className="cp-card-row" style={{ marginTop: 8, borderTop: "1.5px solid #f1f5f9", paddingTop: 8 }}>
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Grand Total</span>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#15803d" }}>{fmt(inv.grandTotal)}</span>
        </div>
      </div>
    </>
  );
}
