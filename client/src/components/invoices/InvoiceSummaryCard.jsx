/**
 * Financial metrics summary grid.
 * Displays pricing subtotal calculations, discounts, transport/delivery charges, tax, paid, and outstanding values.
 * @component
 * @param {Object} props Props
 * @param {Object} props.invoice Active invoice document
 */
export default function InvoiceSummaryCard({ invoice }) {
  if (!invoice) return null;

  const paidAmount = invoice.paymentSummary?.paidAmount || 0;
  const outstandingAmount = invoice.paymentSummary?.outstandingAmount || (invoice.grandTotal - paidAmount);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Financial Summary</h3>
      </div>
      <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
          <span style={{ color: "var(--text-light)" }}>Subtotal:</span>
          <strong style={{ color: "var(--text-main)" }}>₹{(invoice.subtotal || 0).toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px", color: "#b91c1c" }}>
          <span>Discounts Applied ({invoice.discountType === "Percentage" ? `${invoice.discount}%` : "Flat"}):</span>
          <strong>- ₹{(invoice.subtotal - invoice.grandTotal + invoice.transportCharge + invoice.deliveryCharge + invoice.taxAmount || 0).toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
          <span style={{ color: "var(--text-light)" }}>Transport Charge:</span>
          <strong>₹{(invoice.transportCharge || 0).toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
          <span style={{ color: "var(--text-light)" }}>Delivery Charge:</span>
          <strong>₹{(invoice.deliveryCharge || 0).toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
          <span style={{ color: "var(--text-light)" }}>Tax Amount (GST):</span>
          <strong>₹{(invoice.taxAmount || 0).toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid var(--border)", paddingBottom: "8px", color: "var(--primary)", fontSize: "1.05rem", fontWeight: "700" }}>
          <span>Grand Total:</span>
          <span>₹{(invoice.grandTotal || 0).toFixed(2)}</span>
        </div>
        
        {/* Paid and Outstanding indicators */}
        <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a", paddingBottom: "6px" }}>
          <span>Total Paid:</span>
          <strong>₹{paidAmount.toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#dc2626", fontWeight: "600" }}>
          <span>Outstanding Balance:</span>
          <span>₹{outstandingAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
