import React, { useEffect, useState } from "react";
import { useRoleStore } from "../store/roleStore";
import PermissionMatrix from "../components/users/PermissionMatrix";

/**
 * Access control Roles management page.
 * @component
 */
export default function Roles() {
  const { roles, loading, error, fetchRoles, addRole, modifyRole, removeRole } = useRoleStore();
  const [editingRole, setEditingRole] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
    permissions: {},
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({ roleName: "", description: "", permissions: {} });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    // Parse permissions map to standard object
    const perms = {};
    if (role.permissions) {
      if (typeof role.permissions.forEach === "function") {
        role.permissions.forEach((val, key) => {
          perms[key] = { ...val };
        });
      } else {
        Object.keys(role.permissions).forEach((key) => {
          perms[key] = { ...role.permissions[key] };
        });
      }
    }
    setFormData({
      roleName: role.roleName,
      description: role.description || "",
      permissions: perms,
    });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.roleName.trim()) {
      setFormError("Role name is required.");
      return;
    }

    try {
      if (editingRole) {
        await modifyRole(editingRole._id, formData);
      } else {
        await addRole(formData);
      }
      setIsFormOpen(false);
    } catch (err) {
      setFormError(err.message || "Failed to save role details.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await removeRole(id);
    } catch (err) {
      alert(err.message || "Failed to delete role.");
    }
  };

  if (loading && roles.length === 0) return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading roles...</div>;

  return (
    <section id="view-roles" className="view-section">
      <div className="view-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div className="view-title">
          <h1>Role Based Access Control (RBAC)</h1>
          <p>Configure user roles and granular permissions matrices mapping modules to access paths</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          Create New Role
        </button>
      </div>

      {error && <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px" }}>{error}</div>}

      {/* Roles list table */}
      <div className="table-responsive" style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Description</th>
              <th>Type</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role._id}>
                <td style={{ fontWeight: "700" }}>{role.roleName}</td>
                <td>{role.description || "N/A"}</td>
                <td>
                  <span className={`badge badge-${role.isSystemRole ? "success" : "secondary"}`}>
                    {role.isSystemRole ? "System Role" : "Custom"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ marginRight: "8px" }} onClick={() => handleOpenEdit(role)}>Edit Permissions</button>
                  {!role.isSystemRole && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(role._id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Creator overlay Modal */}
      {isFormOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontWeight: "700" }}>{editingRole ? "Edit Role & Permissions Matrix" : "Create Access Control Role"}</h3>
              <button type="button" onClick={() => setIsFormOpen(false)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}>×</button>
            </div>

            {formError && (
              <div style={{ marginBottom: "14px", padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label htmlFor="role-name-in" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Role Name *</label>
                  <input
                    id="role-name-in"
                    type="text"
                    required
                    disabled={editingRole?.isSystemRole}
                    className="form-input"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="role-desc-in" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Role Description</label>
                  <input
                    id="role-desc-in"
                    type="text"
                    className="form-input"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px" }}>Module Permissions Matrix Mapping</label>
                <PermissionMatrix
                  permissions={formData.permissions}
                  disabled={editingRole?.roleName === "Owner"}
                  onChange={(perms) => setFormData({ ...formData, permissions: perms })}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Role Configuration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
