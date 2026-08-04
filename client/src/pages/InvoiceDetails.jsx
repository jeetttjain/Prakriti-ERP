import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInvoiceStore } from "../store/invoiceStore";
import { ROUTES } from "../constants/routes";
import InvoiceStatusBadge from "../components/invoices/InvoiceStatusBadge";
import InvoiceTimeline from "../components/invoices/InvoiceTimeline";
import InvoiceSummaryCard from "../components/invoices/InvoiceSummaryCard";
import FeaturePlaceholder from "../components/common/FeaturePlaceholder";
import ConfirmationModal from "../components/common/ConfirmationModal";

/**
 * Detailed B2B Invoice details dashboard card.
 * @component
 */
export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedInvoice, loading, error, selectInvoice, clearSelectedInvoice } = useInvoiceStore();

  const [placeholderData, setPlaceholderData] = useState(null);

  useEffect(() => {
    if (id) {
      selectInvoice(id);
    }
    return () => {
      clearSelectedInvoice();
    };
  }, [id, selectInvoice, clearSelectedInvoice]);

  const handlePlaceholderRequest = (title, message) => {
    setPlaceholderData({ title, message });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <div className="loader-spinner" style={{ border: "3px solid #f3f3f3", borderTop: "3px solid #16a34a", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
        <span>Retrieving invoice ledger card...</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", textAlign: "center", border: "1px solid #fee2e2", borderRadius: "8px", background: "#fef2f2", color: "#991b1b" }}>
        <h4 style={{ fontWeight: "600", marginBottom: "8px" }}>Error Loading Invoice</h4>
        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.INVOICES)}>
          Back to Invoices
        </button>
      </div>
    );
  }

  if (!selectedInvoice) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <p>Billing invoice record not found.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.INVOICES)} style={{ marginTop: "12px" }}>
          Back to Invoices
        </button>
      </div>
    );
  }

  const customerSnapshot = selectedInvoice.customerSnapshot || {};
  const branchSnapshot = selectedInvoice.branchSnapshot || {};

  return (
    <section id="view-invoice-details" className="view-section">
      <div className="view-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.INVOICES)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Invoices
        </button>
        <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handlePlaceholderRequest("Print Invoice", "Invoice printing routine trigger will launch here.")}
          >
            🖨️ Print Invoice
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handlePlaceholderRequest("Download PDF", "PDF invoice download trigger will launch here.")}
          >
            📄 Download PDF
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handlePlaceholderRequest("Send WhatsApp", "WhatsApp invoice dispatch will trigger here.")}
          >
            💬 WhatsApp Invoice
          </button>
        </div>
        <div className="view-title" style={{ marginTop: "16px" }}>
          <h1>Invoice {selectedInvoice.invoiceNumber}</h1>
          <p>Invoice Sequence: #{selectedInvoice.invoiceSequence} | Type: {selectedInvoice.invoiceType}</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Side main card details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Invoice Items summary list */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Invoiced Items</h3>
              <span className="badge badge-info">{selectedInvoice.invoiceItems?.length || 0} Products</span>
            </div>
            <div className="card-content" style={{ padding: "0" }}>
              <div className="table-container">
                <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.invoiceItems?.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{item.productName} ({item.productCode})</td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.sellingPriceSnapshot || 0).toFixed(2)} / {item.unit}</td>
                        <td style={{ fontWeight: 600 }}>₹{(item.amount || 0).toFixed(2)}</td>
                        <td style={{ color: "var(--text-light)", fontStyle: "italic" }}>{item.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pricing detailed summary card */}
          <InvoiceSummaryCard invoice={selectedInvoice} />

          {/* Billing Notes */}
          {selectedInvoice.notes && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Billing Notes</h3>
              </div>
              <div className="card-content" style={{ padding: "16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                "{selectedInvoice.notes}"
              </div>
            </div>
          )}

          {/* Future sections placeholders */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FeaturePlaceholder
              title="Ledger Synchronizations"
              description="Future double-entry ledger bookkeeping syncs, supplier credits balances adjustments, and automated tax accounting sheets are locked until Ledger Module is deployed."
            />
            <FeaturePlaceholder
              title="Payment Checkout Transactions"
              description="Future payments collection receipts, digital cash/check entries, and partial invoices clearing logs are locked until Payment Module is deployed."
            />
          </div>

        </div>

        {/* Right Side panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Status logs card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Invoice Status</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-light)" }}>Invoice Status:</span>
                <InvoiceStatusBadge type="invoice" value={selectedInvoice.invoiceStatus} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-light)" }}>Payment Status:</span>
                <InvoiceStatusBadge type="payment" value={selectedInvoice.paymentStatus} />
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Invoice Date:</span>
                  <strong>{new Date(selectedInvoice.invoiceDate).toLocaleDateString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Due Date:</span>
                  <strong>{new Date(selectedInvoice.dueDate).toLocaleDateString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Locked Status:</span>
                  <strong>{selectedInvoice.isLocked ? "🔒 Locked (Issued)" : "✏️ Editable (Draft)"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Revision Number:</span>
                  <strong>v{selectedInvoice.revisionNumber}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch notifications status logs */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Dispatch Status</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-light)" }}>PDF Status:</span>
                <strong>{selectedInvoice.pdfStatus}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-light)" }}>WhatsApp Status:</span>
                <strong>{selectedInvoice.whatsappStatus} ({selectedInvoice.whatsappRetryCount} retries)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-light)" }}>Email Status:</span>
                <strong>{selectedInvoice.emailStatus} ({selectedInvoice.emailRetryCount} retries)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-light)" }}>Prints Count:</span>
                <strong>{selectedInvoice.printCount} prints</strong>
              </div>
            </div>
          </div>

          {/* Customer Snapshots */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Customer Snapshot</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>Business Name:</span>
                <strong style={{ color: "var(--text-main)" }}>{customerSnapshot.businessName}</strong>
              </div>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>Contact Person:</span>
                <strong style={{ color: "var(--text-main)" }}>{customerSnapshot.contactPerson}</strong>
              </div>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>Contact Number:</span>
                <strong style={{ color: "var(--text-main)" }}>{customerSnapshot.contactNumber}</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>WhatsApp Number:</span>
                <strong style={{ color: "var(--text-main)" }}>{customerSnapshot.whatsappNumber}</strong>
              </div>
            </div>
          </div>

          {/* Branch Snapshots details */}
          {selectedInvoice.branchSnapshot && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Branch Snapshot</h3>
              </div>
              <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                  <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>Branch Name:</span>
                  <strong style={{ color: "var(--text-main)" }}>{branchSnapshot.branchName}</strong>
                </div>
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                  <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>Contact Person:</span>
                  <strong style={{ color: "var(--text-main)" }}>{branchSnapshot.contactPerson}</strong>
                </div>
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                  <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>Contact Number:</span>
                  <strong style={{ color: "var(--text-main)" }}>{branchSnapshot.contactNumber}</strong>
                </div>
                <div>
                  <span style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem" }}>Shipping Address:</span>
                  <strong style={{ color: "var(--text-main)" }}>{branchSnapshot.address}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Timeline audit log card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Billing Timeline</h3>
            </div>
            <div className="card-content" style={{ padding: "16px" }}>
              <InvoiceTimeline timeline={selectedInvoice.invoiceTimeline} />
            </div>
          </div>

        </div>

      </div>

      <ConfirmationModal
        isOpen={!!placeholderData}
        title={placeholderData?.title || ""}
        message={placeholderData?.message || ""}
        onConfirm={() => setPlaceholderData(null)}
        onCancel={null}
      />
    </section>
  );
}
