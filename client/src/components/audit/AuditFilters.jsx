import React, { useState, useEffect } from "react";
import { useAuditStore } from "../../store/auditStore";

/**
 * Filter toolbar for server-side audit search and filters.
 * @component
 */
export default function AuditFilters() {
  const { moduleFilter, actionTypeFilter, searchQuery, startDateFilter, endDateFilter, setFilters } = useAuditStore();
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // Debounce search input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== searchQuery) {
        setFilters({ searchQuery: searchTerm });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, searchQuery, setFilters]);

  const modulesList = [
    "All",
    "Auth",
    "Users",
    "Roles",
    "Customers",
    "Products",
    "Inventory",
    "Orders",
    "Purchases",
    "Invoices",
    "Payments",
    "Reports",
    "Settings",
    "Customer Portal",
    "Exports",
  ];

  const actionTypesList = ["All", "CREATE", "READ", "UPDATE", "DELETE", "SECURITY", "EXPORT"];

  return (
    <div className="card" style={{ padding: "16px", marginBottom: "20px", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        
        {/* Keyword Search */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
            Search Audit Logs
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Search AUD-#, user, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem" }}
          />
        </div>

        {/* Module Selector */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
            ERP Module
          </label>
          <select
            className="form-control"
            value={moduleFilter}
            onChange={(e) => setFilters({ moduleFilter: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem" }}
          >
            {modulesList.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Action Type Selector */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
            Action Type
          </label>
          <select
            className="form-control"
            value={actionTypeFilter}
            onChange={(e) => setFilters({ actionTypeFilter: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem" }}
          >
            {actionTypesList.map((at) => (
              <option key={at} value={at}>{at}</option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
            Start Date
          </label>
          <input
            type="date"
            className="form-control"
            value={startDateFilter}
            onChange={(e) => setFilters({ startDateFilter: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem" }}
          />
        </div>

        {/* End Date */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
            End Date
          </label>
          <input
            type="date"
            className="form-control"
            value={endDateFilter}
            onChange={(e) => setFilters({ endDateFilter: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem" }}
          />
        </div>

      </div>
    </div>
  );
}
