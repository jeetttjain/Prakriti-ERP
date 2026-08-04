import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../store/productStore";
import { ROUTES } from "../constants/routes";

/**
 * Renders detailed dashboard view card for a selected B2B Product.
 * Contains placeholders for order items and history metrics.
 * @component
 */
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedProduct, loading, error, selectProduct, clearSelectedProduct } = useProductStore();

  useEffect(() => {
    if (id) {
      selectProduct(id);
    }
    return () => {
      clearSelectedProduct();
    };
  }, [id, selectProduct, clearSelectedProduct]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <div className="loader-spinner" style={{ border: "3px solid #f3f3f3", borderTop: "3px solid #16a34a", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
        <span>Retrieving product catalog details...</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", textAlign: "center", border: "1px solid #fee2e2", borderRadius: "8px", background: "#fef2f2", color: "#991b1b" }}>
        <h4 style={{ fontWeight: "600", marginBottom: "8px" }}>Error Loading Product</h4>
        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.PRODUCTS)}>
          Back to Catalog
        </button>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-light)" }}>
        <p>Product catalog item not found.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.PRODUCTS)} style={{ marginTop: "12px" }}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const margin = selectedProduct.sellingPrice - selectedProduct.purchasePrice;
  const marginPercent = selectedProduct.sellingPrice > 0 ? ((margin / selectedProduct.sellingPrice) * 100).toFixed(1) : "0.0";
  const statusBadge =
    selectedProduct.status === "Active"
      ? "badge-success"
      : selectedProduct.status === "Inactive"
      ? "badge-danger"
      : "badge-info";

  return (
    <section id="view-product-details" className="view-section">
      <div className="view-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.PRODUCTS)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Catalog
        </button>
        <div className="view-title" style={{ marginTop: "12px" }}>
          <h1>{selectedProduct.productName}</h1>
          <p>Product Code: {selectedProduct.productCode}</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Basic Details & Stock metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Basic Information</h3>
              <span className={`badge ${statusBadge}`}>
                {selectedProduct.status}
              </span>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Category:</span>
                <strong style={{ color: "var(--text-main)" }}>{selectedProduct.category}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Slug (URL):</span>
                <strong style={{ color: "var(--text-main)" }}>{selectedProduct.slug}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Unit size:</span>
                <strong style={{ color: "var(--text-main)" }}>{selectedProduct.unit}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Display Order:</span>
                <strong style={{ color: "var(--text-main)" }}>{selectedProduct.displayOrder}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Priority:</span>
                <strong style={{ color: "var(--text-main)" }}>{selectedProduct.priority}</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", fontSize: "0.9rem", gap: "4px" }}>
                <span style={{ color: "var(--text-light)" }}>Internal Notes:</span>
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  {selectedProduct.notes ? `"${selectedProduct.notes}"` : "No internal description cataloged."}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Stock Levels</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Current Stock:</span>
                <strong style={{ color: selectedProduct.currentStock <= selectedProduct.minimumStock ? "#ef4444" : "var(--text-main)" }}>
                  {selectedProduct.currentStock} {selectedProduct.unit}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-light)" }}>Minimum Stock Warning:</span>
                <strong style={{ color: "var(--text-main)" }}>{selectedProduct.minimumStock} {selectedProduct.unit}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Margins & Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Pricing Breakdown</h3>
            </div>
            <div className="card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Purchase Price:</span>
                <strong style={{ color: "var(--text-main)" }}>₹{(selectedProduct.purchasePrice || 0).toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Selling Price:</span>
                <strong style={{ color: "var(--primary)" }}>₹{(selectedProduct.sellingPrice || 0).toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-light)" }}>Absolute Margin:</span>
                <strong style={{ color: margin < 0 ? "#ef4444" : "var(--primary)" }}>₹{margin.toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-light)" }}>Margin Percentage:</span>
                <strong style={{ color: margin < 0 ? "#ef4444" : "var(--primary)" }}>{marginPercent}%</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ledger Logs</h3>
            </div>
            <div className="card-content" style={{ padding: "20px", textAlign: "center", color: "var(--text-light)", fontSize: "0.85rem" }}>
              <p>Product purchase history transactions will generate dynamically.</p>
              <div style={{ marginTop: "12px", border: "1px dashed var(--border)", padding: "12px", borderRadius: "6px", background: "#f8fafc" }}>
                🛡️ Locked until Orders module is deployed
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
