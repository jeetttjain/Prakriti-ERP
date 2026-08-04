import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import * as authService from "../services/authService";

/**
 * Access Control Password modification page.
 * @component
 */
export default function ChangePassword() {
  const { clearSession } = useAuthStore();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    if (newPassword.length < 5) {
      setErrorMsg("Password must be at least 5 characters long.");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      setSuccessMsg("Password updated successfully. Logging out active session...");
      
      // Auto Log out session after 2s
      setTimeout(() => {
        clearSession();
        navigate("/login");
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password.");
      setLoading(false);
    }
  };

  return (
    <section id="view-change-password" className="view-section" style={{ maxWidth: "450px", margin: "0 auto" }}>
      <div className="view-header">
        <div className="view-title">
          <h1>Update Password</h1>
          <p>Modify your security pass credentials to secure your workspace session</p>
        </div>
      </div>

      {errorMsg && <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem" }}>{errorMsg}</div>}
      {successMsg && <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#dcfce7", color: "#16a34a", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600" }}>{successMsg}</div>}

      <form onSubmit={handleSubmit} style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div>
          <label htmlFor="old-pass" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Current Password *</label>
          <input
            id="old-pass"
            type="password"
            required
            className="form-input"
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="new-pass" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>New Password *</label>
          <input
            id="new-pass"
            type="password"
            required
            className="form-input"
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="confirm-pass" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Confirm New Password *</label>
          <input
            id="confirm-pass"
            type="password"
            required
            className="form-input"
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "14px", marginTop: "8px" }}>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => navigate("/profile")}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  );
}
