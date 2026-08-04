import React, { useState, useEffect } from "react";
import { useReportStore } from "../../store/reportStore";
import * as customerService from "../../services/customerService";
import * as supplierService from "../../services/supplierService";
import * as productService from "../../services/productService";
import { useSettingsStore } from "../../store/settingsStore";

/**
 * Dynamically toggled select inputs rendering based on report type.
 * @component
 */
export default function ReportFilters() {
  const { selectedReport, filters, setFilters, fetchReportData, resetFilters } = useReportStore();
  const isCategoryEnabled = useSettingsStore((state) => state.isCategoryEnabled);

  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch filter helpers on mount
    customerService.getCustomers(1, 1000, "Active").then((res) => setCustomers(res.data || []));
    supplierService.getSuppliers(1, 1000, "Active").then((res) => setSuppliers(res.data || []));
    productService.getProducts(1, 1000).then((res) => setProducts(res.data || []));
  }, []);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const handleApply = async () => {
    await fetchReportData();
  };

  const handleReset = async () => {
    resetFilters();
    // Allow state update to settle before re-fetching
    setTimeout(async () => {
      await fetchReportData();
    }, 100);
  };

  // Determine which fields to display
  const showCustomer = ["sales", "customer", "payment"].includes(selectedReport);
  const showSupplier = ["purchase", "supplier"].includes(selectedReport);
  const showProduct = ["sales", "purchase", "product"].includes(selectedReport);
  const showCategory = ["sales", "product"].includes(selectedReport);
  const showOrderStatus = ["sales"].includes(selectedReport);
  const showPurchaseStatus = ["purchase"].includes(selectedReport);
  const showPaymentStatus = ["payment"].includes(selectedReport);

  const categories = ["Vegetable", "Fruit", "Dairy", "Grocery", "Beverages", "Packaging"].filter(c => isCategoryEnabled(c));

  // If dashboard or outstanding, no detailed filters required
  if (["dashboard", "outstanding"].includes(selectedReport)) {
    return (
      <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
        <button type="button" className="btn btn-primary" style={{ padding: "8px 24px" }} onClick={handleApply}>Refresh Summary</button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
        {showCustomer && (
          <div>
            <label htmlFor="filter-cust" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px" }}>Customer Account</label>
            <select id="filter-cust" name="customerId" className="form-select" style={{ width: "100%", padding: "8px", borderRadius: "4px" }} value={filters.customerId} onChange={handleSelectChange}>
              <option value="">-- All Customers --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.businessName}</option>
              ))}
            </select>
          </div>
        )}

        {showSupplier && (
          <div>
            <label htmlFor="filter-sup" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px" }}>Supplier Partner</label>
            <select id="filter-sup" name="supplierId" className="form-select" style={{ width: "100%", padding: "8px", borderRadius: "4px" }} value={filters.supplierId} onChange={handleSelectChange}>
              <option value="">-- All Suppliers --</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.businessName}</option>
              ))}
            </select>
          </div>
        )}

        {showProduct && (
          <div>
            <label htmlFor="filter-prod" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px" }}>Product Code</label>
            <select id="filter-prod" name="productId" className="form-select" style={{ width: "100%", padding: "8px", borderRadius: "4px" }} value={filters.productId} onChange={handleSelectChange}>
              <option value="">-- All Products --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.productName}</option>
              ))}
            </select>
          </div>
        )}

        {showCategory && (
          <div>
            <label htmlFor="filter-cat" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px" }}>Category</label>
            <select id="filter-cat" name="category" className="form-select" style={{ width: "100%", padding: "8px", borderRadius: "4px" }} value={filters.category} onChange={handleSelectChange}>
              <option value="">-- All Categories --</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {showOrderStatus && (
          <div>
            <label htmlFor="filter-ord-stat" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px" }}>Order Status</label>
            <select id="filter-ord-stat" name="orderStatus" className="form-select" style={{ width: "100%", padding: "8px", borderRadius: "4px" }} value={filters.orderStatus} onChange={handleSelectChange}>
              <option value="">-- All Statuses --</option>
              {["Pending", "Confirmed", "Processing", "Delivered", "Cancelled"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {showPurchaseStatus && (
          <div>
            <label htmlFor="filter-pur-stat" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px" }}>Purchase Status</label>
            <select id="filter-pur-stat" name="purchaseStatus" className="form-select" style={{ width: "100%", padding: "8px", borderRadius: "4px" }} value={filters.purchaseStatus} onChange={handleSelectChange}>
              <option value="">-- All Statuses --</option>
              {["Pending", "Ordered", "Received", "Cancelled"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {showPaymentStatus && (
          <div>
            <label htmlFor="filter-pay-stat" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px" }}>Payment Status</label>
            <select id="filter-pay-stat" name="paymentStatus" className="form-select" style={{ width: "100%", padding: "8px", borderRadius: "4px" }} value={filters.paymentStatus} onChange={handleSelectChange}>
              <option value="">-- All Statuses --</option>
              {["Pending", "Cleared", "Failed", "Refunded"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset Filters</button>
        <button type="button" className="btn btn-primary" onClick={handleApply}>Apply Filters</button>
      </div>
    </div>
  );
}
