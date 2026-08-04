import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerStore } from "../store/customerStore";
import { ROUTES } from "../constants/routes";

/**
 * Renders detailed dashboard view card for a selected B2B customer.
 * Contains placeholders for orders, billing ledger logs, and branch networks.
 * @component
 */
export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCustomer, loading, error, selectCustomer, clearSelectedCustomer } = useCustomerStore();

  useEffect(() => {
    if (id) {
      selectCustomer(id);
    }
    return () => {
      clearSelectedCustomer();
    };
  }, [id, selectCustomer, clearSelectedCustomer]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <div className="loader-spinner" style={{ border: "3px solid #f3f3f3", borderTop: "3px solid #16a34a", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
        <span>Retrieving customer profile details...</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", textAlign: "center", border: "1px solid #fee2e2", borderRadius: "8px", background: "#fef2f2", color: "#991b1b" }}>
        <h4 style={{ fontWeight: "600", marginBottom: "8px" }}>Error Loading Profile</h4>
        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.CUSTOMERS)}>
          Back to Directory
        </button>
      </div>
    );
  }

  if (!selectedCustomer) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <p>Customer profile not found.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.CUSTOMERS)} style={{ marginTop: "12px" }}>
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <section id="view-customer-details" className="view-section">
      <div className="view-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.CUSTOMERS)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Directory
        </button>
        <div className="view-title" style={{ marginTop: "12px" }}>
          <h1>{selectedCustomer.businessName}</h1>
          <p>B2B Partner Profile Node</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Basic Profile & Branches */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Basic Information</h3>
              <span className={`badge ${selectedCustomer.status === "Active" ? "badge-success" : "badge-danger"}`}>
                {selectedCustomer.status}
              </span>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Contact Person:</span>
                <strong style={{ color: "var(--text-main)" }}>{selectedCustomer.personName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Contact Number:</span>
                <strong style={{ color: "var(--text-main)" }}>+91 {selectedCustomer.contactNumber || selectedCustomer.mobile}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>WhatsApp Number:</span>
                <strong style={{ color: "var(--text-main)" }}>+91 {selectedCustomer.whatsappNumber || selectedCustomer.contactNumber || selectedCustomer.mobile}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>GSTIN:</span>
                <strong style={{ color: "var(--text-main)" }}>{selectedCustomer.gstNumber || "Not Provided"}</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px", gap: "4px" }}>
                <span style={{ color: "var(--text-light)" }}>Billing Address:</span>
                <strong style={{ color: "var(--text-main)", whiteSpace: "pre-line" }}>{selectedCustomer.address}</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", fontSize: "0.9rem", gap: "4px" }}>
                <span style={{ color: "var(--text-light)" }}>Internal Notes:</span>
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  {selectedCustomer.notes ? `"${selectedCustomer.notes}"` : "No internal notes cataloged."}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Credit & Terms</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Credit Limit:</span>
                <strong style={{ color: "var(--primary)" }}>₹{(selectedCustomer.creditLimit || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-light)" }}>Payment Cycle:</span>
                <strong style={{ color: "var(--text-main)" }}>{selectedCustomer.paymentCycle || 15} Days Terms</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Connected Branches</h3>
              <span className="badge badge-info">{selectedCustomer.branches?.length || 0} Nodes</span>
            </div>
            <div className="card-content" style={{ padding: "16px" }}>
              {selectedCustomer.hasBranches && selectedCustomer.branches?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedCustomer.branches.map((b) => (
                    <div key={b._id} style={{ border: "1px solid var(--border)", padding: "10px", borderRadius: "6px", background: "#f8fafc" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <strong style={{ color: "var(--text-main)", fontSize: "0.9rem" }}>{b.branchName}</strong>
                        <span className={`badge ${b.status === "Active" ? "badge-success" : "badge-danger"}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>{b.status}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Contact: {b.personName} | Call: +91 {b.contactNumber || b.mobile} | WhatsApp: +91 {b.whatsappNumber || b.contactNumber || b.mobile}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-light)", marginTop: "4px" }}>
                        Address: {b.address}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-light)", fontSize: "0.9rem", padding: "12px" }}>
                  No multi-branch outlet network configured for this account.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Ledger, Orders & Payments placeholders */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Outstanding Amount</h3>
            </div>
            <div className="card-content" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#64748b" }}>₹0.00</div>
              <div style={{ color: "var(--text-light)", fontSize: "0.8rem", marginTop: "6px" }}>
                Feature to be unlocked in Billing module
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ledger Statement</h3>
            </div>
            <div className="card-content" style={{ padding: "20px", textAlign: "center", color: "var(--text-light)", fontSize: "0.85rem" }}>
              <p>Account statement transactions will be generated dynamically.</p>
              <div style={{ marginTop: "12px", border: "1px dashed var(--border)", padding: "12px", borderRadius: "6px", background: "#f8fafc" }}>
                🛡️ Locked until Payments module is deployed
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="card-content" style={{ padding: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "var(--text-light)", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--border)", paddingBottom: "6px" }}>
                  <span>Recent Orders Log</span>
                  <span style={{ fontStyle: "italic" }}>Locked [Orders]</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--border)", paddingBottom: "6px" }}>
                  <span>Recent Payments Log</span>
                  <span style={{ fontStyle: "italic" }}>Locked [Payments]</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Invoice History Log</span>
                  <span style={{ fontStyle: "italic" }}>Locked [Billing]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
