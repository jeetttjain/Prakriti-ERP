import { useEffect, useState, useCallback } from "react";
import { useOrderStore } from "../../store/orderStore";
import * as customerService from "../../services/customerService";

/**
 * Filter bar panel mapping wholesale order parameters.
 * @component
 */
export default function OrderSearch() {
  const {
    searchQuery,
    statusFilter,
    paymentStatusFilter,
    deliveryStatusFilter,
    customerFilter,
    startDateFilter,
    endDateFilter,
    setSearchQuery,
    setFilters,
    searchOrders,
    resetFilters
  } = useOrderStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [customers, setCustomers] = useState([]);

  // Retrieve customer registry choices
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const result = await customerService.getCustomers(1, 200, "Active");
        setCustomers(result.data || []);
      } catch {
        // Load error
      }
    };
    loadCustomers();
  }, []);

  // Debounced search query triggers
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localQuery);
      searchOrders(localQuery);
    }, 450);

    return () => clearTimeout(handler);
  }, [localQuery, setSearchQuery, searchOrders]);

  const updateSelectedFilter = useCallback((field, val) => {
    setFilters({ [field]: val });
  }, [setFilters]);

  const handleReset = useCallback(async () => {
    setLocalQuery("");
    await resetFilters();
  }, [resetFilters]);

  return (
    <div className="filter-bar" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", background: "var(--card-bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        {/* Search bar query */}
        <div style={{ flex: "1 1 250px" }}>
          <input
            type="text"
            className="form-input"
            style={{ width: "100%", padding: "8px 12px" }}
            placeholder="Search by order number or customer name..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            aria-label="Search by order number or customer name"
            title="Search orders"
          />
        </div>

        {/* Customer option select */}
        <div>
          <select
            className="form-select"
            value={customerFilter}
            onChange={(e) => updateSelectedFilter("customerFilter", e.target.value)}
            aria-label="Filter by customer"
            title="Customer filter"
          >
            <option value="All">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.businessName}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date filter */}
        <div>
          <input
            type="date"
            className="form-input"
            value={startDateFilter}
            onChange={(e) => updateSelectedFilter("startDateFilter", e.target.value)}
            aria-label="Start delivery date"
            title="Start Date"
          />
        </div>

        {/* End Date filter */}
        <div>
          <input
            type="date"
            className="form-input"
            value={endDateFilter}
            onChange={(e) => updateSelectedFilter("endDateFilter", e.target.value)}
            aria-label="End delivery date"
            title="End Date"
          />
        </div>

        {/* Reset settings button */}
        <div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            aria-label="Reset all search filters"
            title="Clear filters"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Lifecycle status filtering tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
        {/* Order status filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Order Status:</span>
          <select
            className="form-select"
            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
            value={statusFilter}
            onChange={(e) => updateSelectedFilter("statusFilter", e.target.value)}
            aria-label="Filter by order status"
          >
            <option value="All">All</option>
            {["Draft", "Confirmed", "Packed", "Out For Delivery", "Delivered", "Cancelled"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Payment status filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Payment:</span>
          <select
            className="form-select"
            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
            value={paymentStatusFilter}
            onChange={(e) => updateSelectedFilter("paymentStatusFilter", e.target.value)}
            aria-label="Filter by payment status"
          >
            <option value="All">All</option>
            {["Pending", "Partial", "Paid"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Delivery status filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Delivery:</span>
          <select
            className="form-select"
            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
            value={deliveryStatusFilter}
            onChange={(e) => updateSelectedFilter("deliveryStatusFilter", e.target.value)}
            aria-label="Filter by delivery status"
          >
            <option value="All">All</option>
            {["Pending", "Packed", "Out For Delivery", "Delivered", "Cancelled"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
