import { useState, useEffect } from "react";
import CustomerSearch from "../components/customers/CustomerSearch";
import CustomerList from "../components/customers/CustomerList";
import CustomerForm from "../components/customers/CustomerForm";
import CustomerQRModal from "../components/customers/CustomerQRModal";
import { useCustomerStore } from "../store/customerStore";

/**
 * Customers Admin Panel view coordinator.
 * Renders listings, search, and form overlays.
 * @component
 */
export default function Customers() {
  const { fetchCustomers, refreshCustomers, loading } = useCustomerStore();
  const [activeFormCustomer, setActiveFormCustomer] = useState(null);
  const [activeQRCustomer, setActiveQRCustomer] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  // Trigger initial paginated customer load
  useEffect(() => {
  fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const handleOpenCreate = () => {
    setActiveFormCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setActiveFormCustomer(customer);
    setIsFormOpen(true);
  };

  const handleOpenQR = (customer) => {
    setActiveQRCustomer(customer);
    setIsQROpen(true);
  };

  const handleFormSaved = () => {
    setIsFormOpen(false);
    fetchCustomers();
  };

  const handleRefresh = async () => {
    if (loading) return;
    await refreshCustomers();
  };

  return (
    <section id="view-customers" className="view-section">
      <div className="view-header">
        <div className="view-title">
          <h1>Customer Management</h1>
          <p>Manage customer accounts, payment terms, QR ordering access and branches.</p>
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
            Add Customer
          </button>
        </div>
      </div>

      <CustomerSearch />
      
      <CustomerList onOpenQR={handleOpenQR} onOpenEdit={handleOpenEdit} />

      {isFormOpen && (
        <CustomerForm
          key={activeFormCustomer?._id || "new"}
          customer={activeFormCustomer}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleFormSaved}
        />
      )}

      {isQROpen && (
        <CustomerQRModal
          customer={activeQRCustomer}
          onClose={() => setIsQROpen(false)}
        />
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}} />
    </section>
  );
}