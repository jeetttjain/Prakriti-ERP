import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseStore } from "../store/purchaseStore";
import ReceivePurchaseModal from "../components/purchases/ReceivePurchaseModal";

/**
 * Detailed view screen for a selected Purchase Order.
 * Renders item logs, receipt states, and post-receipt stock receipts.
 * @component
 */
export default function PurchaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedPurchase,
    loading,
    error,
    selectPurchase,
    clearSelectedPurchase,
    cancelPO,
  } = usePurchaseStore();

  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  useEffect(() => {
    if (id) {
      selectPurchase(id);
    }
    return () => {
      clearSelectedPurchase();
    };
  }, [id, selectPurchase, clearSelectedPurchase]);

  const handleCancelClick = async () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this Purchase Order? This action cannot be undone.");
    if (confirmCancel) {
      try {
        await cancelPO(selectedPurchase._id, "Admin Console User");
        selectPurchase(id); // reload
      } catch (err) {
        alert("Failed to cancel PO: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <div className="loader-spinner" style={{ border: "3px solid #f3f3f3", borderTop: "3px solid #22c55e", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
        <span>Retrieving Purchase Order details...</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", textAlign: "center", border: "1px solid #fee2e2", borderRadius: "8px", background: "#fef2f2", color: "#991b1b" }}>
        <h4 style={{ fontWeight: "600", marginBottom: "8px" }}>Error Loading Purchase Order</h4>
        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/purchases")}>
          Back to Replenishments
        </button>
      </div>
    );
  }

  if (!selectedPurchase) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <p>Purchase Order record not found.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/purchases")} style={{ marginTop: "12px" }}>
          Back to Replenishments
        </button>
      </div>
    );
  }

  const supplier = selectedPurchase.supplierSnapshot || {};

  return (
    <section id="view-purchase-details" className="view-section">
      <div className="view-header" style={{ marginBottom: "20px" }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/purchases")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Replenishments
        </button>
        
        <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700" }}>PO: {selectedPurchase.purchaseNumber}</h1>
              <span className={`badge ${
                selectedPurchase.purchaseStatus === "Received"
                  ? "badge-success"
                  : selectedPurchase.purchaseStatus === "Cancelled"
                  ? "badge-danger"
                  : selectedPurchase.purchaseStatus === "Ordered"
                  ? "badge-warning"
                  : "badge-info"
              }`}>
                {selectedPurchase.purchaseStatus}
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
              Supplier Partner: <strong>{supplier.businessName}</strong> &nbsp;|&nbsp; 
              Type: <strong>{selectedPurchase.purchaseType}</strong>
            </p>
          </div>
          
          {["Draft", "Ordered"].includes(selectedPurchase.purchaseStatus) && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="btn btn-danger" onClick={handleCancelClick}>
                Cancel Order
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setIsReceiveOpen(true)}>
                Receive Goods
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Order Snapshot Summary */}
          <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "1rem", fontWeight: "700", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
              PO Information
            </h3>
            <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 0", color: "#6b7280" }}>Expected Delivery</td>
                  <td style={{ padding: "8px 0", fontWeight: "600", textAlign: "right" }}>
                    {new Date(selectedPurchase.expectedDelivery).toLocaleDateString("en-IN")}
                  </td>
                </tr>
                {selectedPurchase.approvedBy && (
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 0", color: "#6b7280" }}>Approved By</td>
                    <td style={{ padding: "8px 0", fontWeight: "600", textAlign: "right" }}>{selectedPurchase.approvedBy}</td>
                  </tr>
                )}
                {selectedPurchase.approvedAt && (
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 0", color: "#6b7280" }}>Approved At</td>
                    <td style={{ padding: "8px 0", fontWeight: "600", textAlign: "right" }}>
                      {new Date(selectedPurchase.approvedAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                )}
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 0", color: "#6b7280" }}>Subtotal</td>
                  <td style={{ padding: "8px 0", fontWeight: "600", textAlign: "right" }}>₹{(selectedPurchase.subtotal || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 0", color: "#6b7280" }}>Discount</td>
                  <td style={{ padding: "8px 0", fontWeight: "600", textAlign: "right", color: "#ef4444" }}>-₹{(selectedPurchase.discount || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 0", color: "#6b7280" }}>Transport</td>
                  <td style={{ padding: "8px 0", fontWeight: "600", textAlign: "right" }}>+₹{(selectedPurchase.transport || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", color: "#6b7280", fontWeight: "600" }}>Grand Total</td>
                  <td style={{ padding: "8px 0", fontWeight: "700", textAlign: "right", color: "var(--primary-color)" }}>
                    ₹{(selectedPurchase.grandTotal || 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Inventory impact block */}
          {selectedPurchase.purchaseStatus === "Received" && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "20px", color: "#166534" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", marginBottom: "12px", fontSize: "1rem" }}>
                <span>🛡️</span> Inventory Updated Successfully
              </div>
              <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div><strong>Products Added:</strong>
                  <ul style={{ margin: "4px 0", paddingLeft: "16px" }}>
                    {selectedPurchase.purchaseItems.map((item, idx) => (
                      <li key={idx}>{item.productName}: {item.quantity} {item.unit}</li>
                    ))}
                  </ul>
                </div>
                <div><strong>Stock Movement Created:</strong> <span style={{ padding: "2px 6px", background: "#dcfce7", borderRadius: "4px", fontSize: "0.75rem", color: "#15803d", fontWeight: "600" }}>Success</span></div>
                <div><strong>Movement Reference:</strong> {selectedPurchase.purchaseNumber}</div>
              </div>
            </div>
          )}
        </div>

        {/* PO Items Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
              Replenished Items
            </h3>
            <table className="table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", color: "#4b5563" }}>Item</th>
                  <th style={{ padding: "10px 12px", color: "#4b5563", textAlign: "right" }}>Qty Ordered</th>
                  <th style={{ padding: "10px 12px", color: "#4b5563", textAlign: "right" }}>Received</th>
                  <th style={{ padding: "10px 12px", color: "#4b5563", textAlign: "right" }}>Pending</th>
                  <th style={{ padding: "10px 12px", color: "#4b5563", textAlign: "right" }}>Unit Price</th>
                  <th style={{ padding: "10px 12px", color: "#4b5563", textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedPurchase.purchaseItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "700" }}>{item.productName}</span>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.productCode}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "500" }}>{item.quantity} {item.unit}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: item.receivedQuantity > 0 ? "var(--primary-color)" : "#6b7280" }}>
                      {item.receivedQuantity} {item.unit}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: item.pendingQuantity > 0 ? "#d97706" : "#6b7280" }}>
                      {item.pendingQuantity} {item.unit}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>₹{(item.purchasePrice || 0).toFixed(2)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "600" }}>₹{(item.amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isReceiveOpen && (
        <ReceivePurchaseModal
          purchase={selectedPurchase}
          onClose={() => setIsReceiveOpen(false)}
          onSuccess={() => selectPurchase(id)} // reload details after receipt
        />
      )}
    </section>
  );
}
