import React, { useEffect, useState, useCallback } from "react";
import { usePurchaseStore } from "../../store/purchaseStore";
import * as supplierService from "../../services/supplierService";

/**
 * Filter controllers panel for Purchase Orders list view.
 * Displays status selection tabs and a Supplier filter dropdown.
 * @component
 */
export default function PurchaseFilters() {
  const {
    statusFilter,
    supplierFilter,
    setFilters,
    setSupplierFilter,
    searchQuery,
    searchPurchases,
    resetFilters,
  } = usePurchaseStore();

  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    supplierService
      .getSuppliers(1, 1000, "Active")
      .then((res) => setSuppliers(res.data || []))
      .catch((err) => console.error("Failed to load active suppliers:", err));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setFilters(status);
    searchPurchases(searchQuery, status, supplierFilter);
  }, [searchQuery, supplierFilter, setFilters, searchPurchases]);

  const handleSupplierChange = useCallback((e) => {
    const supId = e.target.value;
    setSupplierFilter(supId);
    searchPurchases(searchQuery, statusFilter, supId);
  }, [searchQuery, statusFilter, setSupplierFilter, searchPurchases]);

  return (
    <div className="filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
      
      {/* Status tabs */}
      <div className="filter-group" id="purchase-status-tabs" style={{ display: "flex", gap: "6px" }}>
        {["All", "Draft", "Ordered", "Received", "Cancelled"].map((status) => (
          <button
            key={status}
            type="button"
            className={`filter-tab ${statusFilter === status ? "active" : ""}`}
            onClick={() => handleStatusChange(status)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              background: statusFilter === status ? "var(--primary-color, #22c55e)" : "var(--card-bg, #fff)",
              color: statusFilter === status ? "#fff" : "var(--text-main, #374151)",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Supplier Dropdown */}
      <div className="filter-group">
        <select
          className="form-select"
          style={{ padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", background: "var(--card-bg)" }}
          value={supplierFilter}
          onChange={handleSupplierChange}
          aria-label="Filter by supplier partner"
        >
          <option value="All">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>
              {s.businessName}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <div className="filter-group" style={{ marginLeft: "auto" }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={resetFilters}
          aria-label="Reset all search queries and filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
