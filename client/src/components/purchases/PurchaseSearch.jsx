import React, { useEffect, useState } from "react";
import { usePurchaseStore } from "../../store/purchaseStore";

/**
 * Debounced search input component for Purchase list queries.
 * @component
 */
export default function PurchaseSearch() {
  const { searchQuery, setSearchQuery, searchPurchases, statusFilter, supplierFilter } = usePurchaseStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setSearchQuery(localQuery);
        searchPurchases(localQuery, statusFilter, supplierFilter);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [localQuery, searchQuery, statusFilter, supplierFilter, setSearchQuery, searchPurchases]);

  return (
    <div className="filter-group" style={{ flex: "1 1 250px" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className="form-input"
          style={{ width: "100%", padding: "10px 16px", paddingLeft: "36px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
          placeholder="Search by Purchase Number or Supplier Name..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          aria-label="Search purchase orders"
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
            color: "#9ca3af",
          }}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
    </div>
  );
}
