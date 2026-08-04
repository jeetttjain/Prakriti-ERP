import { useState, useEffect } from "react";
import ProductSearch from "../components/products/ProductSearch";
import ProductList from "../components/products/ProductList";
import ProductForm from "../components/products/ProductForm";
import { useProductStore } from "../store/productStore";

/**
 * Products Admin Panel view coordinator.
 * Renders listings, search, and form overlays.
 * @component
 */
export default function Products() {
  const { fetchProducts, refreshProducts, loading } = useProductStore();
  const [activeFormProduct, setActiveFormProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Trigger initial paginated products load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenCreate = () => {
    setActiveFormProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setActiveFormProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSaved = () => {
    setIsFormOpen(false);
    fetchProducts();
  };

  const handleRefresh = async () => {
    await refreshProducts();
  };

  return (
    <section id="view-products" className="view-section">
      <div className="view-header">
        <div className="view-title">
          <h1>Product Catalog</h1>
          <p>Manage pricing, unit dimensions, and current inventory stock status</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={loading ? "spin-icon" : ""}
              style={{ animation: loading ? "spin 1.5s linear infinite" : "none" }}
            >
              <path d="M23 4v6h-6"></path>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Product
          </button>
        </div>
      </div>

      <ProductSearch />
      
      <ProductList onOpenEdit={handleOpenEdit} />

      {isFormOpen && (
        <ProductForm
          key={activeFormProduct?._id || "new"}
          product={activeFormProduct}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleFormSaved}
        />
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}} />
    </section>
  );
}
