import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * Access Control user profile context view.
 * @component
 */
export default function Profile() {
  const { currentUser, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <section id="view-profile" className="view-section" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="view-header">
        <div className="view-title">
          <h1>User Account Profile</h1>
          <p>Manage your account profile, check permissions and view system status</p>
        </div>
      </div>

      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-color)", color: "#fff", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: "700" }}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: "800" }}>{currentUser?.name || "System Operator"}</h2>
            <span className="badge badge-secondary" style={{ marginTop: "4px", display: "inline-block" }}>{currentUser?.role || "Staff"}</span>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "10px 0" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", fontSize: "0.9rem" }}>
          <span style={{ fontWeight: "600", color: "#6b7280" }}>Email Address</span>
          <span>{currentUser?.email || "N/A"}</span>

          <span style={{ fontWeight: "600", color: "#6b7280" }}>Account Status</span>
          <span style={{ color: "#10b981", fontWeight: "700" }}>Active</span>

          <span style={{ fontWeight: "600", color: "#6b7280" }}>System Permissions</span>
          <span>{currentUser?.role === "Owner" ? "Full Access privileges (Super Administrator)" : "Granular module access limits"}</span>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <Link to="/change-password" className="btn btn-primary" style={{ padding: "8px 16px" }}>
            🔒 Change Password
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchProfile()}
            style={{ padding: "8px 16px" }}
          >
            🔄 Sync Profile
          </button>
        </div>
      </div>
    </section>
  );
}
