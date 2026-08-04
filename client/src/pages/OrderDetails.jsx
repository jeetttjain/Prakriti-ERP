import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../store/orderStore";
import { ROUTES } from "../constants/routes";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import OrderTimeline from "../components/orders/OrderTimeline";
import FeaturePlaceholder from "../components/common/FeaturePlaceholder";

/**
 * Detailed Order details console panel displaying items list, calculations, and progress timeline.
 * Includes feature cards for upcoming modules.
 * @component
 */
export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, loading, error, selectOrder, clearSelectedOrder } = useOrderStore();

  useEffect(() => {
    if (id) {
      selectOrder(id);
    }
    return () => {
      clearSelectedOrder();
    };
  }, [id, selectOrder, clearSelectedOrder]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <div className="loader-spinner" style={{ border: "3px solid #f3f3f3", borderTop: "3px solid #16a34a", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
        <span>Retrieving wholesale order logs...</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", textAlign: "center", border: "1px solid #fee2e2", borderRadius: "8px", background: "#fef2f2", color: "#991b1b" }}>
        <h4 style={{ fontWeight: "600", marginBottom: "8px" }}>Error Loading Order</h4>
        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.ORDERS)}>
          Back to Orders
        </button>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <p>Wholesale order transaction records not found.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.ORDERS)} style={{ marginTop: "12px" }}>
          Back to Orders
        </button>
      </div>
    );
  }

  const customerSnapshot = selectedOrder.customerSnapshot || {};
  const branchSnapshot = selectedOrder.branchSnapshot || {};

  return (
    <section id="view-order-details" className="view-section">
      <div className="view-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.ORDERS)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Orders
        </button>
        <div className="view-title" style={{ marginTop: "12px" }}>
          <h1>Order {selectedOrder.orderNumber}</h1>
          <p>Order Placed: {new Date(selectedOrder.orderDate).toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left main details panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Items Summary Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Order Items</h3>
              <span className="badge badge-info">{selectedOrder.orderItems?.length || 0} Products</span>
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
                    {selectedOrder.orderItems?.map((item, idx) => (
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

          {/* Pricing Details Breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Pricing Breakdown</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Subtotal Amount:</span>
                <strong style={{ color: "var(--text-main)" }}>₹{(selectedOrder.subtotal || 0).toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px", color: "#b91c1c" }}>
                <span>Discounts Applied ({selectedOrder.discountType === "Percentage" ? `${selectedOrder.discount}%` : "Flat"}):</span>
                <strong>- ₹{(selectedOrder.subtotal - selectedOrder.grandTotal + selectedOrder.transportCharge + selectedOrder.deliveryCharge || 0).toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Transport Charge:</span>
                <strong style={{ color: "var(--text-main)" }}>₹{(selectedOrder.transportCharge || 0).toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Delivery Dispatch Charge:</span>
                <strong style={{ color: "var(--text-main)" }}>₹{(selectedOrder.deliveryCharge || 0).toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                <span style={{ color: "var(--primary)", fontWeight: "700" }}>Grand Total Amount:</span>
                <strong style={{ color: "var(--primary)", fontSize: "1.2rem" }}>₹{(selectedOrder.grandTotal || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Notes Panels */}
          <div className="form-grid-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Customer Instructions</h3>
              </div>
              <div className="card-content" style={{ padding: "16px", minHeight: "80px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {selectedOrder.customerNotes ? `"${selectedOrder.customerNotes}"` : "No special instructions logged."}
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Admin Processing Notes</h3>
              </div>
              <div className="card-content" style={{ padding: "16px", minHeight: "80px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {selectedOrder.adminNotes ? `"${selectedOrder.adminNotes}"` : "No processing notes recorded."}
              </div>
            </div>
          </div>

          {/* Future expansion placeholders */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FeaturePlaceholder
              title="Invoice Ledger & PDF Downloads"
              description="Future Invoices billing, tax rates calculations, and PDF generation tools are locked until Invoice Module is deployed."
            />
            <FeaturePlaceholder
              title="Payments Transaction History"
              description="Future credit payments logs, checkout records, and gateway receipts are locked until Payment Module is deployed."
            />
            <FeaturePlaceholder
              title="Inventory Dispatch Movement"
              description="Nightly supplies stocks adjustments and vehicle dispatch movement tracking logs are locked until Stocks Module is deployed."
            />
          </div>

        </div>

        {/* Right side panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Status & Logistics Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Order Status</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>Order Status:</span>
                <OrderStatusBadge type="order" value={selectedOrder.orderStatus} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>Payment Status:</span>
                <OrderStatusBadge type="payment" value={selectedOrder.paymentStatus} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>Delivery Status:</span>
                <OrderStatusBadge type="delivery" value={selectedOrder.deliveryStatus} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>Billing Status:</span>
                <OrderStatusBadge type="invoice" value={selectedOrder.invoiceStatus} />
              </div>
              
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Expected Date:</span>
                  <strong>{new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Delivery Slot:</span>
                  <strong>{selectedOrder.deliverySlot}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Assigned Vehicle:</span>
                  <strong>{selectedOrder.assignedVehicle || "Not Assigned"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-light)" }}>Assigned Driver:</span>
                  <strong>{selectedOrder.assignedDriver || "Not Assigned"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Profile Snapshots */}
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

          {/* Branch Profile Snapshot */}
          {selectedOrder.branchId && (
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

          {/* Timeline Audit Logs */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Audit Timeline</h3>
            </div>
            <div className="card-content" style={{ padding: "16px" }}>
              <OrderTimeline timeline={selectedOrder.orderTimeline} />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
