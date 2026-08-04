import { useState, useEffect } from "react";
import OrderSearch from "../components/orders/OrderSearch";
import OrderList from "../components/orders/OrderList";
import OrderForm from "../components/orders/OrderForm";
import { useOrderStore } from "../store/orderStore";

/**
 * Wholesale Orders Management admin console panel.
 * Co-ordinates search widgets, index lists, and place-order form views.
 * @component
 */
export default function Orders() {
  const { fetchOrders, refreshOrders, loading } = useOrderStore();
  const [activeFormOrder, setActiveFormOrder] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Trigger initial list load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenCreate = () => {
    setActiveFormOrder(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (order) => {
    setActiveFormOrder(order);
    setIsFormOpen(true);
  };

  const handleFormSaved = () => {
    setIsFormOpen(false);
    fetchOrders();
  };

  const handleRefresh = async () => {
    await refreshOrders();
  };

  return (
    <section id="view-orders" className="view-section">
      <div className="view-header">
        <div className="view-title">
          <h1>Wholesale Orders</h1>
          <p>Process, coordinate, and dispatch nightly supply chain vegetable invoices</p>
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
            Add Order
          </button>
        </div>
      </div>

      <OrderSearch />

      <OrderList onOpenEdit={handleOpenEdit} />

      {isFormOpen && (
        <OrderForm
          key={activeFormOrder?._id || "new"}
          order={activeFormOrder}
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
