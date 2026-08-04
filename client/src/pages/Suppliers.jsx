import React, { useEffect, useState } from "react";
import { useSupplierStore } from "../store/supplierStore";
import SupplierStatsCards from "../components/suppliers/SupplierStatsCards";
import SupplierSearch from "../components/suppliers/SupplierSearch";
import SupplierFilters from "../components/suppliers/SupplierFilters";
import SupplierTable from "../components/suppliers/SupplierTable";
import SupplierForm from "../components/suppliers/SupplierForm";

/**
 * Supplier catalog panel view.
 * @component
 */
export default function Suppliers() {
  const { fetchSuppliers, refreshSuppliers, stats, loading } = useSupplierStore();
  const [activeSupplier, setActiveSupplier] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenCreate = () => {
    setActiveSupplier(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setActiveSupplier(supplier);
    setIsFormOpen(true);
  };

  return (
    <section id="view-suppliers" className="view-section">
      <div className="view-header">
        <div className="view-title">
          <h1>Supplier Partner Directory</h1>
          <p>Register farm partners, manage contact profiles, and track payment terms</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={refreshSuppliers}
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
              style={{ animation: loading ? "spin 1.5s linear infinite" : "none" }}
            >
              <path d="M23 4v6h-6"></path>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Supplier
          </button>
        </div>
      </div>

      <SupplierStatsCards stats={stats} />

      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px", alignItems: "center" }}>
          <SupplierSearch />
          <SupplierFilters />
        </div>

        <SupplierTable onOpenEdit={handleOpenEdit} />
      </div>

      {isFormOpen && (
        <SupplierForm
          supplier={activeSupplier}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </section>
  );
}
