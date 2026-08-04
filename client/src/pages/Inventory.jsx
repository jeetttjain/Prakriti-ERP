import React, { useEffect, useState } from "react";
import { useInventoryStore } from "../store/inventoryStore";
import InventoryStatsCards from "../components/inventory/InventoryStatsCards";
import InventorySearch from "../components/inventory/InventorySearch";
import InventoryFilters from "../components/inventory/InventoryFilters";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryAdjustmentModal from "../components/inventory/InventoryAdjustmentModal";
import MovementHistoryModal from "../components/inventory/MovementHistoryModal";
import * as productService from "../services/productService";

/**
 * Inventory Screen panel coordinator.
 * Manages states, filters, summary cards, and modals.
 * @component
 */
export default function Inventory() {
  const { fetchInventory, stats, refreshInventory, loading, registerOpeningStock } = useInventoryStore();
  const [adjustItem, setAdjustItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [isOpeningStockOpen, setIsOpeningStockOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <section id="view-inventory" className="view-section">
      <div className="view-header">
        <div className="view-title">
          <h1>Stock Inventory Management</h1>
          <p>Monitor warehouse distribution levels, track reservations, and log historical audits</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={refreshInventory}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: loading ? "spin 1.5s linear infinite" : "none" }}
            >
              <path d="M23 4v6h-6"></path>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsOpeningStockOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Register Opening Stock
          </button>
        </div>
      </div>

      <InventoryStatsCards stats={stats} />

      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px", alignItems: "center" }}>
          <InventorySearch />
          <InventoryFilters />
        </div>

        <InventoryTable onOpenAdjustment={setAdjustItem} onOpenHistory={setHistoryItem} />
      </div>

      {/* Adjust Stock Overlay */}
      {adjustItem && (
        <InventoryAdjustmentModal inventory={adjustItem} onClose={() => setAdjustItem(null)} />
      )}

      {/* Movement History Overlay */}
      {historyItem && (
        <MovementHistoryModal inventory={historyItem} onClose={() => setHistoryItem(null)} />
      )}

      {/* Opening Stock Overlay Form */}
      {isOpeningStockOpen && (
        <OpeningStockModal
          onClose={() => setIsOpeningStockOpen(false)}
          onSave={registerOpeningStock}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </section>
  );
}

/**
 * Opening Stock Creation sub-modal helper.
 */
function OpeningStockModal({ onClose, onSave }) {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [minimumStock, setMinimumStock] = useState("10");
  const [reorderLevel, setReorderLevel] = useState("20");
  const [maximumStock, setMaximumStock] = useState("500");
  const [location, setLocation] = useState("Main Warehouse");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loadingProds, setLoadingProds] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    productService
      .getProducts(1, 1000)
      .then((res) => {
        setProducts(res.data || []);
        setLoadingProds(false);
      })
      .catch(() => {
        setErrorMsg("Failed to retrieve products list.");
        setLoadingProds(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      setErrorMsg("Please select a product.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    try {
      await onSave({
        productId,
        currentStock: Number(currentStock) || 0,
        minimumStock: Number(minimumStock) || 0,
        reorderLevel: Number(reorderLevel) || 0,
        maximumStock: Number(maximumStock) || 0,
        location,
        batchNumber,
        expiryDate: expiryDate || null,
        remarks: remarks || "Opening Stock Setup",
        createdBy: "Admin Console User",
      });
      setIsSaving(false);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to establish opening stock.");
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontWeight: "700" }}>Register Opening Stock</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}
          >
            ×
          </button>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: "16px", padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fee2e2", borderRadius: "6px", fontSize: "0.85rem" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label htmlFor="prod-select" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Select Product</label>
            <select
              id="prod-select"
              className="form-select"
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
              required
              disabled={loadingProds}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.productName} ({p.productCode})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label htmlFor="open-stock" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Opening Stock Level</label>
              <input
                id="open-stock"
                type="number"
                className="form-input"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                required
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <label htmlFor="open-loc" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Warehouse Location</label>
              <select
                id="open-loc"
                className="form-select"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Cold Storage">Cold Storage</option>
                <option value="Shop">Shop</option>
                <option value="Vehicle">Vehicle</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div>
              <label htmlFor="min-stock" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Min Stock</label>
              <input
                id="min-stock"
                type="number"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reorder-stock" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Reorder Level</label>
              <input
                id="reorder-stock"
                type="number"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="max-stock" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Max Stock</label>
              <input
                id="max-stock"
                type="number"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                min="0"
                value={maximumStock}
                onChange={(e) => setMaximumStock(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label htmlFor="batch-no" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Batch (Optional)</label>
              <input
                id="batch-no"
                type="text"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. BATCH-A"
              />
            </div>
            <div>
              <label htmlFor="exp-date" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Expiry (Optional)</label>
              <input
                id="exp-date"
                type="date"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="opening-remarks" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Remarks</label>
            <textarea
              id="opening-remarks"
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", minHeight: "50px" }}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Initial comments..."
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving || loadingProds}>
              {isSaving ? "Saving..." : "Establish Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
