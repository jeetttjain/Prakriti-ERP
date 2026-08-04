import React, { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { useRoleStore } from "../store/roleStore";

/**
 * Access Control user accounts management page.
 * @component
 */
export default function Users() {
  const { users, loading, error, fetchUsers, addUser, modifyUser, removeUser, resetUserPassword } = useUserStore();
  const { roles, fetchRoles } = useRoleStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    roleId: "",
    status: "Active",
    userCode: "",
  });

  // Admin resets password states
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", mobile: "", password: "", roleId: roles[0]?._id || "", status: "Active", userCode: "" });
    setFormError("");
    setResetSuccess("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile || "",
      password: "",
      roleId: user.roleId?._id || "",
      status: user.status || "Active",
      userCode: user.userCode || "",
    });
    setFormError("");
    setResetSuccess("");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.roleId) {
      setFormError("Selecting an Access Role is required.");
      return;
    }

    try {
      if (editingUser) {
        await modifyUser(editingUser._id, formData);
      } else {
        await addUser(formData);
      }
      setIsFormOpen(false);
    } catch (err) {
      setFormError(err.message || "Failed to save user account.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      await removeUser(id);
    } catch (err) {
      alert(err.message || "Failed to delete user.");
    }
  };

  const handleAdminResetPassword = async (e) => {
    e.preventDefault();
    setResetSuccess("");
    setFormError("");
    if (!newPasswordVal.trim()) return;

    try {
      await resetUserPassword(editingUser._id, newPasswordVal.trim());
      setResetSuccess("User password reset successfully. Change password forced on next login.");
      setNewPasswordVal("");
      setResettingPassword(false);
    } catch (err) {
      setFormError(err.message || "Failed to reset password.");
    }
  };

  if (loading && users.length === 0) return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading users...</div>;

  return (
    <section id="view-users" className="view-section">
      <div className="view-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div className="view-title">
          <h1>User Accounts Manager</h1>
          <p>Register system operators, block active logins, and update security roles settings</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          Register User
        </button>
      </div>

      {error && <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px" }}>{error}</div>}

      {/* Users table list */}
      <div className="table-responsive" style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
        <table className="table">
          <thead>
            <tr>
              <th>User Code</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={{ fontWeight: "600" }}>{user.userCode}</td>
                <td style={{ fontWeight: "700" }}>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.mobile || "N/A"}</td>
                <td>
                  <span className="badge badge-secondary" style={{ textTransform: "capitalize" }}>
                    {user.roleId?.roleName || "N/A"}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${user.status === "Active" ? "success" : "danger"}`}>
                    {user.status}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ marginRight: "8px" }} onClick={() => handleOpenEdit(user)}>Edit Account</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Form overlay Modal */}
      {isFormOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontWeight: "700" }}>{editingUser ? "Edit User Account details" : "Register User Account"}</h3>
              <button type="button" onClick={() => setIsFormOpen(false)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}>×</button>
            </div>

            {formError && (
              <div style={{ marginBottom: "14px", padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem" }}>
                {formError}
              </div>
            )}
            {resetSuccess && (
              <div style={{ marginBottom: "14px", padding: "8px 12px", background: "#dcfce7", color: "#16a34a", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600" }}>
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label htmlFor="usr-name" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Full Name *</label>
                  <input id="usr-name" type="text" required className="form-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="usr-code" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>User Code (Optional)</label>
                  <input id="usr-code" type="text" className="form-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={formData.userCode} onChange={(e) => setFormData({ ...formData, userCode: e.target.value })} placeholder="e.g. USR-0012" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label htmlFor="usr-email" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Email Address *</label>
                  <input id="usr-email" type="email" required className="form-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="usr-mobile" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Contact Number</label>
                  <input id="usr-mobile" type="tel" className="form-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label htmlFor="usr-pass" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Default Password *</label>
                  <input id="usr-pass" type="password" required className="form-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label htmlFor="usr-role" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Security Access Role *</label>
                  <select id="usr-role" required className="form-select" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }} value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}>
                    <option value="">-- Choose Role --</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>{r.roleName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="usr-status" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Account status *</label>
                  <select id="usr-status" required className="form-select" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Admin Force Password reset widget */}
              {editingUser && (
                <div style={{ padding: "14px", border: "1px dashed var(--border-color)", borderRadius: "8px", marginTop: "10px" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: "700" }}>Admin Password Reset</h4>
                  {!resettingPassword ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setResettingPassword(true)}>Reset User Password</button>
                  ) : (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="form-input"
                        style={{ padding: "6px", fontSize: "0.8rem", borderRadius: "4px", border: "1px solid var(--border-color)", flex: 1 }}
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                      />
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setResettingPassword(false)}>Cancel</button>
                      <button type="button" className="btn btn-primary btn-sm" onClick={handleAdminResetPassword}>Reset</button>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid var(--border-color)", paddingTop: "14px", marginTop: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
