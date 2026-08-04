/**
 * Financial metrics summary grid for Payment details.
 * Displays invoice total, previous payments summaries, fees, and net receipts.
 * @component
 * @param {Object} props Props
 * @param {Object} props.payment Active payment record
 */
export default function PaymentSummaryCard({ payment }) {
  if (!payment) return null;

  const invoice = payment.invoiceId || {};
  const paidAmount = invoice.paymentSummary?.paidAmount || 0;
  const outstandingAmount = invoice.paymentSummary?.outstandingAmount || 0;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Financial Summary</h3>
      </div>
      <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
          <span style={{ color: "var(--text-light)" }}>Invoice Grand Total:</span>
          <strong style={{ color: "var(--text-main)" }}>₹{(invoice.grandTotal || 0).toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
          <span style={{ color: "var(--text-light)" }}>Invoice Paid Amount:</span>
          <strong>₹{paidAmount.toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
          <span style={{ color: "var(--text-light)" }}>Invoice Outstanding Amount:</span>
          <strong>₹{outstandingAmount.toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
          <span style={{ color: "var(--text-light)" }}>Payment Received Amount:</span>
          <strong style={{ color: "var(--primary)" }}>₹{(payment.amountReceived || 0).toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px", color: "#dc2626" }}>
          <span>Transaction Fee Deducted:</span>
          <strong>- ₹{(payment.transactionFee || 0).toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a", fontSize: "1.05rem", fontWeight: "700" }}>
          <span>Net Settlement Received:</span>
          <span>₹{(payment.netReceived || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
