import { useEffect, useState, useCallback } from "react";
import { usePaymentStore } from "../../store/paymentStore";
import * as customerService from "../../services/customerService";

/**
 * Filter bar panel mapping B2B payment parameters.
 * @component
 */
export default function PaymentSearch() {
  const {
    searchQuery,
    statusFilter,
    methodFilter,
    typeFilter,
    customerFilter,
    startDateFilter,
    endDateFilter,
    setSearchQuery,
    setFilters,
    searchPayments,
    resetFilters
  } = usePaymentStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [customers, setCustomers] = useState([]);

  // Retrieve customer choices
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
      searchPayments(localQuery);
    }, 450);

    return () => clearTimeout(handler);
  }, [localQuery, setSearchQuery, searchPayments]);

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
            placeholder="Search by payment number, receipt, order, or method..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            aria-label="Search by payment reference parameters"
            title="Search payments"
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
            aria-label="Start date"
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
            aria-label="End date"
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

      {/* Multi filter panels */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
        {/* Payment status filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Payment Status:</span>
          <select
            className="form-select"
            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
            value={statusFilter}
            onChange={(e) => updateSelectedFilter("statusFilter", e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All</option>
            {["Pending", "Completed", "Failed", "Cancelled", "Refunded"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Payment method filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Payment Method:</span>
          <select
            className="form-select"
            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
            value={methodFilter}
            onChange={(e) => updateSelectedFilter("methodFilter", e.target.value)}
            aria-label="Filter by method"
          >
            <option value="All">All</option>
            {["UPI", "Cash", "Bank Transfer", "Cheque", "Card", "Wallet"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Payment Type filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Payment Type:</span>
          <select
            className="form-select"
            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
            value={typeFilter}
            onChange={(e) => updateSelectedFilter("typeFilter", e.target.value)}
            aria-label="Filter by type"
          >
            <option value="All">All</option>
            {["Full Payment", "Partial Payment", "Advance", "Adjustment", "Refund"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
