import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInventoryStore } from "../store/inventoryStore";
import StockStatusBadge from "../components/inventory/StockStatusBadge";
import InventoryAdjustmentModal from "../components/inventory/InventoryAdjustmentModal";
import MovementHistoryModal from "../components/inventory/MovementHistoryModal";

/**
 * Detailed view screen for a single Inventory stock profile.
 * Displays associated product snapshots, metrics, batch details, and action triggers.
 * @component
 */
export default function InventoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedInventory,
    loading,
    error,
    selectInventory,
    clearSelectedInventory,
  } = useInventoryStore();

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (id) {
      selectInventory(id);
    }
    return () => {
      clearSelectedInventory();
    };
  }, [id, selectInventory, clearSelectedInventory]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <div className="loader-spinner" style={{ border: "3px solid #f3f3f3", borderTop: "3px solid #22c55e", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
        <span>Retrieving inventory stock record...</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", textAlign: "center", border: "1px solid #fee2e2", borderRadius: "8px", background: "#fef2f2", color: "#991b1b" }}>
        <h4 style={{ fontWeight: "600", marginBottom: "8px" }}>Error Loading Inventory Record</h4>
        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/inventory")}>
          Back to Inventory
        </button>
      </div>
    );
  }

  if (!selectedInventory) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <p>Inventory record not found.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/inventory")} style={{ marginTop: "12px" }}>
          Back to Inventory
        </button>
      </div>
    );
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const product = selectedInventory.productId || {};

  return (
    <section id="view-inventory-details" className="view-section">
      <div className="view-header" style={{ marginBottom: "20px" }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/inventory")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Inventory
        </button>
        <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700" }}>{product.productName || "Product"}</h1>
              <StockStatusBadge status={selectedInventory.stockStatus} />
            </div>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
              Inventory Code: <strong>{selectedInventory.inventoryCode}</strong> &nbsp;|&nbsp; 
              Product Code: <strong>{product.productCode || "N/A"}</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsHistoryOpen(true)}>
              View Movement Log
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setIsAdjustOpen(true)}>
              Adjust Stock Level
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginTop: "20px" }}>
        
        {/* Stock Volume Metrics */}
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
            Stock Volumes
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Current Physical Stock</span>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "4px" }}>
                {selectedInventory.currentStock} {selectedInventory.stockUnit}
              </div>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Reserved Stock</span>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "4px", color: "#6b7280" }}>
                {selectedInventory.reservedStock} {selectedInventory.stockUnit}
              </div>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Available For Sale</span>
              <div style={{ fontSize: "1.75rem", fontWeight: "700", marginTop: "4px", color: "var(--primary-color, #22c55e)" }}>
                {selectedInventory.availableStock} {selectedInventory.stockUnit}
              </div>
            </div>
            <div style={{ borderTop: "1px dashed var(--border-color)", gridColumn: "span 2", paddingTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Minimum</span>
                <div style={{ fontWeight: "600", marginTop: "2px" }}>{selectedInventory.minimumStock}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Reorder Level</span>
                <div style={{ fontWeight: "600", marginTop: "2px" }}>{selectedInventory.reorderLevel}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Maximum</span>
                <div style={{ fontWeight: "600", marginTop: "2px" }}>{selectedInventory.maximumStock}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Tracking & Batches */}
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
            Warehouse & Batches
          </h3>
          <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Storage Location</td>
                <td style={{ padding: "10px 0", fontWeight: "600", textAlign: "right" }}>{selectedInventory.location}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Batch Number</td>
                <td style={{ padding: "10px 0", fontWeight: "600", textAlign: "right" }}>{selectedInventory.batchNumber || "N/A"}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Expiry Date</td>
                <td style={{ padding: "10px 0", fontWeight: "600", textAlign: "right" }}>
                  {selectedInventory.expiryDate ? new Date(selectedInventory.expiryDate).toLocaleDateString("en-IN") : "N/A"}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Last Movement</td>
                <td style={{ padding: "10px 0", fontWeight: "600", textAlign: "right" }}>{formatDateTime(selectedInventory.lastMovementDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0", color: "#6b7280", fontWeight: "500" }}>Remarks</td>
                <td style={{ padding: "10px 0", fontWeight: "500", textAlign: "right", color: "#6b7280" }}>{selectedInventory.remarks || "No remarks"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Overlay */}
      {isAdjustOpen && (
        <InventoryAdjustmentModal
          inventory={selectedInventory}
          onClose={() => setIsAdjustOpen(false)}
        />
      )}

      {/* Movement History Overlay */}
      {isHistoryOpen && (
        <MovementHistoryModal
          inventory={selectedInventory}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </section>
  );
}
