import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupplierStore } from "../store/supplierStore";
import * as purchaseService from "../services/purchaseService";
import SupplierForm from "../components/suppliers/SupplierForm";

/**
 * Detailed view screen for a selected Supplier.
 * Displays associated profiles, address details, notes, and Purchase history statistics.
 * @component
 */
export default function SupplierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedSupplier, loading, error, selectSupplier, clearSelectedSupplier } = useSupplierStore();
  
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      selectSupplier(id);
      loadPurchaseHistory(id);
    }
    return () => {
      clearSelectedSupplier();
    };
  }, [id, selectSupplier, clearSelectedSupplier]);

  const loadPurchaseHistory = async (supplierId) => {
    setHistoryLoading(true);
    try {
      // Fetch purchases using query filter by supplier ID
      const res = await purchaseService.getPurchases(1, 20, "", supplierId);
      setPurchaseHistory(res.data || []);
      setHistoryLoading(false);
    } catch (err) {
      console.error("Failed to retrieve supplier purchase history:", err);
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <div className="loader-spinner" style={{ border: "3px solid #f3f3f3", borderTop: "3px solid #22c55e", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
        <span>Retrieving supplier partner details...</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", textAlign: "center", border: "1px solid #fee2e2", borderRadius: "8px", background: "#fef2f2", color: "#991b1b" }}>
        <h4 style={{ fontWeight: "600", marginBottom: "8px" }}>Error Loading Supplier</h4>
        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/suppliers")}>
          Back to Directory
        </button>
      </div>
    );
  }

  if (!selectedSupplier) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <p>Supplier partner profile not found.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/suppliers")} style={{ marginTop: "12px" }}>
          Back to Directory
        </button>
      </div>
    );
  }

  // Calculate statistics from purchase history
  const receivedPurchases = purchaseHistory.filter((p) => p.purchaseStatus === "Received");
  const outstandingPurchases = purchaseHistory.filter((p) => ["Draft", "Ordered"].includes(p.purchaseStatus));
  
  const totalPurchasesAmount = receivedPurchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
  const outstandingCount = outstandingPurchases.length;
  
  const lastPurchaseDate = purchaseHistory.length > 0
    ? new Date(Math.max(...purchaseHistory.map((p) => new Date(p.purchaseDate))))
    : null;

  return (
    <section id="view-supplier-details" className="view-section">
      <div className="view-header" style={{ marginBottom: "20px" }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/suppliers")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Directory
        </button>
        <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700" }}>{selectedSupplier.businessName}</h1>
              <span className={`badge ${selectedSupplier.status === "Active" ? "badge-success" : "badge-danger"}`}>
                {selectedSupplier.status}
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
              Supplier Code: <strong>{selectedSupplier.supplierCode}</strong> &nbsp;|&nbsp; 
              Category: <strong>{selectedSupplier.supplierCategory}</strong>
            </p>
          </div>
          <div>
            <button type="button" className="btn btn-primary" onClick={() => setIsEditOpen(true)}>
              Edit Partner Profile
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Analytics Metrics Cards */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "500" }}>Total Purchase Volume</span>
          <h3 style={{ margin: "8px 0 0 0", fontSize: "1.5rem", fontWeight: "700", color: "var(--primary-color)" }}>
            ₹{totalPurchasesAmount.toFixed(2)}
          </h3>
          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>From {receivedPurchases.length} received orders</span>
        </div>
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "500" }}>Outstanding POs</span>
          <h3 style={{ margin: "8px 0 0 0", fontSize: "1.5rem", fontWeight: "700", color: "#3b82f6" }}>
            {outstandingCount} orders
          </h3>
          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Draft & Ordered statuses</span>
        </div>
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "500" }}>Last Purchase Date</span>
          <h3 style={{ margin: "8px 0 0 0", fontSize: "1.3rem", fontWeight: "700" }}>
            {lastPurchaseDate ? lastPurchaseDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Never"}
          </h3>
          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Procurement log latest date</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        {/* Profile Card */}
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
            Profile Details
          </h3>
          <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Contact Person</td>
                <td style={{ padding: "10px 0", fontWeight: "600", textAlign: "right" }}>{selectedSupplier.personName}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Mobile Number</td>
                <td style={{ padding: "10px 0", fontWeight: "600", textAlign: "right" }}>{selectedSupplier.mobile}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>GSTIN</td>
                <td style={{ padding: "10px 0", fontWeight: "600", textAlign: "right" }}>{selectedSupplier.gst || "N/A"}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Supplier Rating</td>
                <td style={{ padding: "10px 0", fontWeight: "600", textAlign: "right", color: "#eab308" }}>
                  {"★".repeat(selectedSupplier.supplierRating || 5)}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Payment Terms</td>
                <td style={{ padding: "10px 0", fontWeight: "600", textAlign: "right" }}>{selectedSupplier.paymentTerms || "COD"}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Address</td>
                <td style={{ padding: "10px 0", fontWeight: "600", textAlign: "right", whiteSpace: "pre-line" }}>{selectedSupplier.address || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Notes</td>
                <td style={{ padding: "10px 0", fontWeight: "500", textAlign: "right", color: "#6b7280" }}>{selectedSupplier.notes || "None"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Purchase History log */}
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
            Purchase History Log
          </h3>

          {historyLoading ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>Loading purchase logs...</div>
          ) : purchaseHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#9ca3af" }}>No purchase orders recorded for this supplier.</div>
          ) : (
            <table className="table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "8px 12px", fontWeight: "600" }}>PO Number</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600" }}>Order Date</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600" }}>Type</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600", textAlign: "right" }}>Grand Total</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "8px 12px", fontWeight: "600", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map((po) => (
                  <tr key={po._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "8px 12px", fontWeight: "600" }}>{po.purchaseNumber}</td>
                    <td style={{ padding: "8px 12px", color: "#6b7280" }}>
                      {new Date(po.purchaseDate).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding: "8px 12px" }}>{po.purchaseType}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: "600" }}>
                      ₹{(po.grandTotal || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <span className={`badge ${
                        po.purchaseStatus === "Received"
                          ? "badge-success"
                          : po.purchaseStatus === "Cancelled"
                          ? "badge-danger"
                          : "badge-info"
                      }`}>
                        {po.purchaseStatus}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                        onClick={() => navigate(`/purchases/${po._id}`)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isEditOpen && (
        <SupplierForm
          supplier={selectedSupplier}
          onClose={() => {
            setIsEditOpen(false);
            selectSupplier(id); // Reload
            loadPurchaseHistory(id);
          }}
        />
      )}
    </section>
  );
}
