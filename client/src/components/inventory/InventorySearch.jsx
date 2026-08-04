import React, { useEffect, useState } from "react";
import { useInventoryStore } from "../../store/inventoryStore";

/**
 * Debounced search input component for querying inventory profiles.
 * @component
 */
export default function InventorySearch() {
  const { searchQuery, setSearchQuery, searchInventory, statusFilter, locationFilter } = useInventoryStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Synchronize local input state with global reset triggers
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Debounce query execution to reduce database load
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setSearchQuery(localQuery);
        searchInventory(localQuery, statusFilter, locationFilter);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [localQuery, searchQuery, statusFilter, locationFilter, setSearchQuery, searchInventory]);

  return (
    <div className="filter-group" style={{ flex: "1 1 250px" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className="form-input"
          style={{ width: "100%", padding: "10px 16px", paddingLeft: "36px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
          placeholder="Search by Product Name, Category, Product Code, or Inventory Code..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          aria-label="Search inventory list"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "16px",
            height: "16px",
            color: "var(--text-muted, #9ca3af)",
          }}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
    </div>
  );
}
