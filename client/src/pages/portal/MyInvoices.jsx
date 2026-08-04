import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCustomerPortalStore } from "../../store/customerPortalStore";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_FILTERS = ["All", "Issued", "Partially Paid", "Paid", "Cancelled"];

const invBadge = (s) => {
  if (s === "Paid") return "cp-badge-success";
  if (s === "Cancelled") return "cp-badge-danger";
  if (s === "Partially Paid") return "cp-badge-warning";
  return "cp-badge-info";
};

/**
 * Customer portal invoices list page.
 * @component
 */
export default function MyInvoices() {
  const { invoices, invoicesTotal, fetchInvoices, loading } = useCustomerPortalStore();
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchInvoices(filter !== "All" ? { status: filter } : {});
  }, [filter]);

  return (
    <>
      <h1 className="cp-section-title" style={{ fontSize: "1rem", marginBottom: 14 }}>My Invoices</h1>

      <div className="cp-filter-row">
        {STATUS_FILTERS.map((s) => (
          <button key={s} className={`cp-filter-chip ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading...</div>
      ) : invoices.length === 0 ? (
        <div className="cp-empty"><div className="cp-empty-icon">🧾</div>No invoices found</div>
      ) : (
        <>
          <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 10 }}>
            {invoicesTotal} invoice{invoicesTotal !== 1 ? "s" : ""} found
          </p>
          {invoices.map((inv) => (
            <Link
              to={`/portal/invoices/${inv._id}`}
              key={inv._id}
              className="cp-card"
              style={{ display: "block", textDecoration: "none" }}
            >
              <div className="cp-card-row">
                <span className="cp-card-number">{inv.invoiceNumber}</span>
                <span className={`cp-badge ${invBadge(inv.invoiceStatus)}`}>{inv.invoiceStatus}</span>
              </div>
              <div className="cp-card-row" style={{ marginTop: 8 }}>
                <span className="cp-card-label">Due {fmtDate(inv.dueDate)}</span>
                <span className="cp-card-value">{fmt(inv.grandTotal)}</span>
              </div>
              {inv.paymentSummary?.outstandingAmount > 0 && (
                <div style={{ marginTop: 6, fontSize: "0.72rem", color: "#dc2626", fontWeight: 600 }}>
                  Outstanding: {fmt(inv.paymentSummary.outstandingAmount)}
                </div>
              )}
            </Link>
          ))}
        </>
      )}
    </>
  );
}
