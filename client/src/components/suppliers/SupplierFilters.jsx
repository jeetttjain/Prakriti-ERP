import React, { useCallback } from "react";
import { useSupplierStore } from "../../store/supplierStore";

/**
 * Filters sidebar controls for Supplier list view.
 * @component
 */
export default function SupplierFilters() {
  const {
    statusFilter,
    categoryFilter,
    setFilters,
    setCategoryFilter,
    searchQuery,
    searchSuppliers,
    resetFilters,
  } = useSupplierStore();

  const handleStatusChange = useCallback((status) => {
    setFilters(status);
    searchSuppliers(searchQuery, status, categoryFilter);
  }, [searchQuery, categoryFilter, setFilters, searchSuppliers]);

  const handleCategoryChange = useCallback((e) => {
    const cat = e.target.value;
    setCategoryFilter(cat);
    searchSuppliers(searchQuery, statusFilter, cat);
  }, [searchQuery, statusFilter, setCategoryFilter, searchSuppliers]);

  const categories = ["Farmer", "Wholesaler", "Distributor", "Manufacturer"];

  return (
    <div className="filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
      
      {/* Status tabs */}
      <div className="filter-group" id="supplier-status-tabs" style={{ display: "flex", gap: "6px" }}>
        {["All", "Active", "Inactive"].map((status) => (
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

      {/* Category Dropdown */}
      <div className="filter-group">
        <select
          className="form-select"
          style={{ padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", background: "var(--card-bg)" }}
          value={categoryFilter}
          onChange={handleCategoryChange}
          aria-label="Filter by supplier category"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
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
