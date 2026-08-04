import React, { useCallback } from "react";
import { useInventoryStore } from "../../store/inventoryStore";

/**
 * Filter controllers panel for Inventory records.
 * Integrates stock levels, warehousing location filters, and reset hooks.
 * @component
 */
export default function InventoryFilters() {
  const {
    statusFilter,
    locationFilter,
    setStatusFilter,
    setLocationFilter,
    searchQuery,
    searchInventory,
    resetFilters,
  } = useInventoryStore();

  const handleStatusChange = useCallback((status) => {
    setStatusFilter(status);
    searchInventory(searchQuery, status, locationFilter);
  }, [searchQuery, locationFilter, setStatusFilter, searchInventory]);

  const handleLocationChange = useCallback((e) => {
    const loc = e.target.value;
    setLocationFilter(loc);
    searchInventory(searchQuery, statusFilter, loc);
  }, [searchQuery, statusFilter, setLocationFilter, searchInventory]);

  return (
    <div className="filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
      
      {/* Status tabs */}
      <div className="filter-group" id="inventory-status-tabs" style={{ display: "flex", gap: "6px" }}>
        {["All", "In Stock", "Low Stock", "Out Of Stock"].map((status) => (
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

      {/* Location Dropdown */}
      <div className="filter-group">
        <select
          className="form-select"
          style={{ padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", background: "var(--card-bg)" }}
          value={locationFilter}
          onChange={handleLocationChange}
          aria-label="Filter by warehouse location"
        >
          <option value="All">All Locations</option>
          <option value="Main Warehouse">Main Warehouse</option>
          <option value="Cold Storage">Cold Storage</option>
          <option value="Shop">Shop</option>
          <option value="Vehicle">Vehicle</option>
        </select>
      </div>

      {/* Reset Controls Button */}
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
