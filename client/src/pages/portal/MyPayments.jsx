import { useEffect } from "react";
import { useCustomerPortalStore } from "../../store/customerPortalStore";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const methodIcon = (m) => {
  const map = { Cash: "💵", UPI: "📱", "Bank Transfer": "🏦", Cheque: "📄", Card: "💳", Wallet: "👛" };
  return map[m] || "💰";
};

const badgeClass = (s) => {
  if (s === "Settled" || s === "Confirmed") return "cp-badge-success";
  if (s === "Pending") return "cp-badge-warning";
  if (s === "Failed") return "cp-badge-danger";
  return "cp-badge-neutral";
};

/**
 * Customer portal payments and outstanding balance page.
 * @component
 */
export default function MyPayments() {
  const { payments, paymentsTotal, outstanding, fetchPayments, fetchOutstanding, loading } =
    useCustomerPortalStore();

  useEffect(() => {
    fetchPayments();
    fetchOutstanding();
  }, []);

  const totalOutstanding = outstanding?.totalOutstanding || 0;

  return (
    <>
      <h1 className="cp-section-title" style={{ fontSize: "1rem", marginBottom: 14 }}>Payments & Outstanding</h1>

      {/* Outstanding Banner */}
      {totalOutstanding > 0 ? (
        <div className="cp-outstanding-banner">
          <span className="cp-outstanding-label">Total Outstanding Balance</span>
          <span className="cp-outstanding-amount">{fmt(totalOutstanding)}</span>
          <span style={{ fontSize: "0.72rem", opacity: 0.8 }}>
            {outstanding?.invoices?.length || 0} open invoice{outstanding?.invoices?.length !== 1 ? "s" : ""}
          </span>
        </div>
      ) : (
        <div className="cp-alert-info">✅ No outstanding balance. You're all caught up!</div>
      )}

      {/* Outstanding Invoices */}
      {outstanding?.invoices?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p className="cp-section-title">Outstanding Invoices</p>
          {outstanding.invoices.map((inv) => (
            <div key={inv._id} className="cp-card">
              <div className="cp-card-row">
                <span className="cp-card-number">{inv.invoiceNumber}</span>
                <span style={{ fontSize: "0.85rem", color: "#dc2626", fontWeight: 700 }}>
                  {fmt(inv.paymentSummary?.outstandingAmount)}
                </span>
              </div>
              <div className="cp-card-row" style={{ marginTop: 8 }}>
                <span className="cp-card-label">Due {fmtDate(inv.dueDate)}</span>
                <span className={`cp-badge ${inv.invoiceStatus === "Partially Paid" ? "cp-badge-warning" : "cp-badge-info"}`}>
                  {inv.invoiceStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment History */}
      <div>
        <p className="cp-section-title">Payment History ({paymentsTotal})</p>
        {loading ? (
          <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading...</div>
        ) : payments.length === 0 ? (
          <div className="cp-empty"><div className="cp-empty-icon">💳</div>No payments recorded</div>
        ) : (
          payments.map((p) => (
            <div key={p._id} className="cp-card">
              <div className="cp-card-row">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.2rem" }}>{methodIcon(p.paymentMethod)}</span>
                  <span className="cp-card-number">{p.paymentNumber}</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#15803d" }}>{fmt(p.amount)}</span>
              </div>
              <div className="cp-card-row" style={{ marginTop: 8 }}>
                <span className="cp-card-label">{fmtDate(p.paymentDate)} · {p.paymentMethod}</span>
                <span className={`cp-badge ${badgeClass(p.paymentStatus)}`}>{p.paymentStatus}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
