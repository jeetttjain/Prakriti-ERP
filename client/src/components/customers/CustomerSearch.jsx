import { useEffect, useState, useCallback } from "react";
import { useCustomerStore } from "../../store/customerStore";
import { FILTER_STATUS } from "../../constants/status";
import { PAYMENT_CYCLE } from "../../constants/paymentCycle";

/**
 * Filter and search debounced inputs.
 * Avoids asynchronous state races by passing arguments directly.
 * @component
 */
export default function CustomerSearch() {
  const {
    searchQuery,
    statusFilter,
    paymentCycleFilter,
    setSearchQuery,
    setFilters,
    setPaymentCycleFilter,
    searchCustomers,
    resetFilters
  } = useCustomerStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounced search query trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localQuery);
      // Pass parameters directly to avoid state race conditions
      searchCustomers(localQuery, statusFilter, paymentCycleFilter);
    }, 400);

    return () => clearTimeout(handler);
  }, [localQuery, statusFilter, paymentCycleFilter, setSearchQuery, searchCustomers]);

  const handleStatusChange = useCallback((status) => {
    setFilters(status);
    searchCustomers(localQuery, status, paymentCycleFilter);
  }, [localQuery, paymentCycleFilter, setFilters, searchCustomers]);

  const handlePaymentCycleChange = useCallback((e) => {
    const cycle = e.target.value;
    setPaymentCycleFilter(cycle);
    searchCustomers(localQuery, statusFilter, cycle);
  }, [localQuery, statusFilter, setPaymentCycleFilter, searchCustomers]);

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
          placeholder="Search business, contact person or mobile..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          aria-label="Search business, contact person or mobile number"
          title="Search database query"
        />
      </div>

      {/* Status activation tabs */}
      <div className="filter-group" id="customer-status-tabs">
        {[FILTER_STATUS.ACTIVE, FILTER_STATUS.INACTIVE, FILTER_STATUS.ALL].map((tab) => (
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

      {/* Payment terms select dropdown */}
      <div className="filter-group">
        <select
          className="form-select"
          style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px" }}
          value={paymentCycleFilter}
          onChange={handlePaymentCycleChange}
          aria-label="Filter by payment cycle terms"
          title="Payment Term cycles filter"
        >
          <option value="All">All Payment Cycles</option>
          <option value={PAYMENT_CYCLE.TERM_7}>7 Days Terms</option>
          <option value={PAYMENT_CYCLE.TERM_15}>15 Days Terms</option>
          <option value={PAYMENT_CYCLE.TERM_30}>30 Days Terms</option>
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
