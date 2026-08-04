import React from "react";
import { useAutomationStore } from "../../store/automationStore";

/**
 * Filter toolbar for Automation Rules.
 * @component
 */
export default function AutomationFilters() {
  const { moduleFilter, triggerFilter, setFilters } = useAutomationStore();

  const modules = ["All", "Orders", "Invoices", "Inventory", "Purchases", "Payments", "Users", "Customers", "Exports", "System"];
  const triggers = [
    "All",
    "ORDER_CREATED",
    "ORDER_DELIVERED",
    "INVOICE_PAID",
    "INVENTORY_LOW",
    "PURCHASE_RECEIVED",
    "USER_LOGIN",
    "CUSTOMER_CREATED",
  ];

  return (
    <div className="card" style={{ padding: "16px", marginBottom: "20px", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        
        {/* Module Filter */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
            Module Filter
          </label>
          <select
            className="form-control"
            value={moduleFilter}
            onChange={(e) => setFilters({ moduleFilter: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem" }}
          >
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Trigger Filter */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
            Trigger Event
          </label>
          <select
            className="form-control"
            value={triggerFilter}
            onChange={(e) => setFilters({ triggerFilter: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem" }}
          >
            {triggers.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}
