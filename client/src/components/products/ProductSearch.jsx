import { useEffect, useState, useCallback, useMemo } from "react";
import { useProductStore } from "../../store/productStore";
import { useSettingsStore } from "../../store/settingsStore";

/**
 * Filter and search debounced inputs.
 * Avoids asynchronous state races by passing arguments directly.
 * @component
 */
export default function ProductSearch() {
  const {
    searchQuery,
    statusFilter,
    categoryFilter,
    setSearchQuery,
    setFilters,
    setCategoryFilter,
    searchProducts,
    resetFilters
  } = useProductStore();

  const isCategoryEnabled = useSettingsStore((state) => state.isCategoryEnabled);

  const categoriesList = useMemo(() => {
    const list = [];
    if (isCategoryEnabled("Vegetable")) list.push("Vegetable");
    if (isCategoryEnabled("Fruit")) list.push("Fruit");
    if (isCategoryEnabled("Dairy")) list.push("Dairy");
    if (isCategoryEnabled("Grocery")) list.push("Grocery");
    if (isCategoryEnabled("Beverages")) list.push("Beverages");
    if (isCategoryEnabled("Packaging")) list.push("Packaging");
    return list;
  }, [isCategoryEnabled]);

  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounced search query trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localQuery);
      // Pass parameters directly to avoid state race conditions
      searchProducts(localQuery, statusFilter, categoryFilter);
    }, 400);

    return () => clearTimeout(handler);
  }, [localQuery, statusFilter, categoryFilter, setSearchQuery, searchProducts]);

  const handleStatusChange = useCallback((status) => {
    setFilters(status);
    searchProducts(localQuery, status, categoryFilter);
  }, [localQuery, categoryFilter, setFilters, searchProducts]);

  const handleCategoryChange = useCallback((e) => {
    const cat = e.target.value;
    setCategoryFilter(cat);
    searchProducts(localQuery, statusFilter, cat);
  }, [localQuery, statusFilter, setCategoryFilter, searchProducts]);

  const handleReset = useCallback(async () => {
    setLocalQuery("");
    await resetFilters();
  }, [resetFilters]);

  return (
    <div className="filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
      {/* Search Input field */}
      <div className="filter-group" style={{ flex: "1 1 250px" }}>
        <input
          type="text"
          className="form-input"
          style={{ width: "100%", padding: "8px 12px" }}
          placeholder="Search by product name, category or unit..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          aria-label="Search by product name, category or unit of measurement"
          title="Search database query"
        />
      </div>

      {/* Status activation tabs */}
      <div className="filter-group" id="product-status-tabs">
        {["Active", "Inactive", "Archived", "All"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`filter-tab ${statusFilter === tab ? "active" : ""}`}
            onClick={() => handleStatusChange(tab)}
            aria-label={`Filter by status ${tab}`}
            title={`Show only ${tab} profiles`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Category select dropdown */}
      <div className="filter-group">
        <select
          className="form-select"
          style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px" }}
          value={categoryFilter}
          onChange={handleCategoryChange}
          aria-label="Filter by product category"
          title="Category selector filter"
        >
          <option value="All">All Categories</option>
          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Clear/Reset settings button */}
      <div className="filter-group">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleReset}
          aria-label="Reset all search filters"
          title="Clear search queries"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
