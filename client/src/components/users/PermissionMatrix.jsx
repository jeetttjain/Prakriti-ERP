import React from "react";

const MODULES = [
  "Customer",
  "Supplier",
  "Product",
  "Purchase",
  "Inventory",
  "Order",
  "Invoice",
  "Payment",
  "Reports",
  "Dashboard",
  "Settings",
  "Automation",
  "AI",
];

const ACTIONS = ["view", "create", "edit", "delete", "export", "approve"];

/**
 * Visual matrix mapping actions to ERP modules.
 * @component
 * @param {Object} props
 * @param {Object} props.permissions Map of permissions key-value pairs
 * @param {Function} props.onChange Callback onChange(updatedPermissions)
 * @param {boolean} [props.disabled=false]
 */
export default function PermissionMatrix({ permissions = {}, onChange, disabled = false }) {
  const handleCheckboxChange = (mod, act, checked) => {
    const updated = { ...permissions };
    if (!updated[mod]) {
      updated[mod] = { view: false, create: false, edit: false, delete: false, export: false, approve: false };
    }
    updated[mod] = {
      ...updated[mod],
      [act]: checked,
    };
    onChange(updated);
  };

  const getPermissionValue = (mod, act) => {
    const modPerm = permissions[mod];
    if (!modPerm) return false;
    // Map is serialised as map object, so handle both standard objects and potential Map shapes
    if (typeof modPerm.get === "function") {
      return !!modPerm.get(act);
    }
    return !!modPerm[act];
  };

  return (
    <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--card-bg, #fff)" }}>
      <table className="table" style={{ margin: 0 }}>
        <thead>
          <tr>
            <th style={{ width: "200px" }}>ERP Module</th>
            {ACTIONS.map((act) => (
              <th key={act} style={{ textAlign: "center", textTransform: "capitalize" }}>
                {act}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODULES.map((mod) => (
            <tr key={mod}>
              <td style={{ fontWeight: "600" }}>{mod}</td>
              {ACTIONS.map((act) => {
                const isChecked = getPermissionValue(mod, act);
                return (
                  <td key={act} style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      style={{ transform: "scale(1.2)", cursor: disabled ? "not-allowed" : "pointer" }}
                      onChange={(e) => handleCheckboxChange(mod, act, e.target.checked)}
                      aria-label={`${act} permission for ${mod}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
