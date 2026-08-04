import { useEffect } from "react";
import { useCustomerPortalStore } from "../../store/customerPortalStore";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const PAYMENT_CYCLES = {
  "Net 7": "7 days", "Net 15": "15 days", "Net 30": "30 days",
  "Net 45": "45 days", "Net 60": "60 days", "Prepaid": "Prepaid",
};

/**
 * Customer portal profile page.
 * @component
 */
export default function MyProfile() {
  const { profile, fetchProfile, loading, customer } = useCustomerPortalStore();

  useEffect(() => { fetchProfile(); }, []);

  const c = profile || {};

  return (
    <>
      {/* Avatar header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #15803d, #166534)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.8rem", margin: "0 auto 10px", color: "#fff", fontWeight: 700,
        }}>
          {(c.businessName || "?")[0]?.toUpperCase()}
        </div>
        <h2 style={{ fontWeight: 800, fontSize: "1rem", color: "#111827", margin: 0 }}>
          {c.businessName}
        </h2>
        <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "4px 0 0" }}>
          {c.customerCode}
        </p>
      </div>

      {loading ? (
        <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading...</div>
      ) : (
        <>
          <div className="cp-card" style={{ marginBottom: 12 }}>
            <p className="cp-section-title" style={{ marginBottom: 10 }}>Business Details</p>
            {[
              ["Business Name", c.businessName],
              ["Contact Person", c.personName],
              ["Mobile", c.mobile],
              ["WhatsApp", c.whatsappNumber],
              ["GST Number", c.gstNumber || "—"],
              ["Payment Cycle", PAYMENT_CYCLES[c.paymentCycle] || c.paymentCycle || "—"],
            ].map(([k, v]) => (
              <div className="cp-profile-row" key={k}>
                <span className="cp-profile-key">{k}</span>
                <span className="cp-profile-val">{v || "—"}</span>
              </div>
            ))}
          </div>

          {c.address && (
            <div className="cp-card" style={{ marginBottom: 12 }}>
              <p className="cp-section-title" style={{ marginBottom: 10 }}>Address</p>
              <div className="cp-profile-row">
                <span className="cp-profile-key">Address</span>
                <span className="cp-profile-val">{c.address}</span>
              </div>
              {c.city && (
                <div className="cp-profile-row">
                  <span className="cp-profile-key">City</span>
                  <span className="cp-profile-val">{c.city}</span>
                </div>
              )}
            </div>
          )}

          {c.branches?.length > 0 && (
            <div className="cp-card">
              <p className="cp-section-title" style={{ marginBottom: 10 }}>Branches ({c.branches.length})</p>
              {c.branches.map((b, i) => (
                <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < c.branches.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827", marginBottom: 4 }}>
                    📍 {b.branchName}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{b.contactPerson} · {b.contactNumber}</div>
                  {b.address && <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>{b.address}</div>}
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 20, paddingBottom: 8 }}>
            <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
              Last login: {fmtDate(c.portalLastLogin)} &nbsp;·&nbsp;
              Portal enabled since {fmtDate(c.createdAt)}
            </p>
          </div>
        </>
      )}
    </>
  );
}
