import React, { useState } from "react";
import { createRule } from "../../services/automationService";
import { useAutomationStore } from "../../store/automationStore";

/**
 * Modal form for creating a new Automation Rule.
 * @component
 */
export default function AutomationForm({ isOpen, onClose }) {
  const { fetchRules, fetchStatsAndHealth } = useAutomationStore();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    module: "Orders",
    trigger: "ORDER_CREATED",
    priority: "MEDIUM",
    scheduleInterval: "EVENT_DRIVEN",
    actionType: "SEND_NOTIFICATION",
    actionMessage: "Automated alert triggered.",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createRule({
        name: formData.name,
        description: formData.description,
        module: formData.module,
        trigger: formData.trigger,
        priority: formData.priority,
        scheduleInterval: formData.scheduleInterval,
        conditions: [],
        actions: [
          {
            actionType: formData.actionType,
            config: { message: formData.actionMessage },
          },
        ],
      });

      await fetchRules(1);
      await fetchStatsAndHealth();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create rule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
      <div style={{ background: "var(--card-bg, #fff)", width: "520px", maxWidth: "90vw", padding: "24px", borderRadius: "8px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Create Automation Rule</h3>

        {error && <div style={{ color: "#dc2626", background: "#fef2f2", padding: "8px 12px", borderRadius: "6px", marginBottom: "14px", fontSize: "0.85rem" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#4b5563" }}>Rule Name</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#4b5563" }}>Description</label>
            <input
              type="text"
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#4b5563" }}>ERP Module</label>
              <select
                className="form-control"
                value={formData.module}
                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
              >
                <option value="Orders">Orders</option>
                <option value="Invoices">Invoices</option>
                <option value="Inventory">Inventory</option>
                <option value="Purchases">Purchases</option>
                <option value="Users">Users</option>
                <option value="Exports">Exports</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#4b5563" }}>Trigger Event</label>
              <select
                className="form-control"
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
              >
                <option value="ORDER_CREATED">ORDER_CREATED</option>
                <option value="ORDER_DELIVERED">ORDER_DELIVERED</option>
                <option value="INVOICE_PAID">INVOICE_PAID</option>
                <option value="INVENTORY_LOW">INVENTORY_LOW</option>
                <option value="PURCHASE_RECEIVED">PURCHASE_RECEIVED</option>
                <option value="USER_LOGIN">USER_LOGIN</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#4b5563" }}>Action Plugin</label>
              <select
                className="form-control"
                value={formData.actionType}
                onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
              >
                <option value="SEND_NOTIFICATION">SEND_NOTIFICATION</option>
                <option value="SEND_EMAIL">SEND_EMAIL</option>
                <option value="SEND_WHATSAPP">SEND_WHATSAPP</option>
                <option value="SEND_SMS">SEND_SMS</option>
                <option value="CREATE_AUDIT_ENTRY">CREATE_AUDIT_ENTRY</option>
                <option value="GENERATE_REPORT">GENERATE_REPORT</option>
                <option value="BACKUP_DATABASE">BACKUP_DATABASE</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#4b5563" }}>Schedule Interval</label>
              <select
                className="form-control"
                value={formData.scheduleInterval}
                onChange={(e) => setFormData({ ...formData, scheduleInterval: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
              >
                <option value="EVENT_DRIVEN">EVENT_DRIVEN</option>
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#4b5563" }}>Action Message Payload</label>
            <input
              type="text"
              className="form-control"
              value={formData.actionMessage}
              onChange={(e) => setFormData({ ...formData, actionMessage: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? "Saving..." : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
