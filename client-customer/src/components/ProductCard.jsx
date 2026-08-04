import React from "react";
import { useCustomerStore } from "../store/customerStore";

/**
 * Mobile Product Card with low stock badge, dynamic pricing, and quick Add button.
 * @component
 */
export default function ProductCard({ product }) {
  const { addToCart } = useCustomerStore();

  const isLowStock = product.currentStock > 0 && product.currentStock <= (product.minimumStock || 10);
  const isOutOfStock = product.currentStock <= 0;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#16a34a" }}>{product.category || "Produce"}</span>
          {isOutOfStock ? (
            <span className="badge badge-danger">Out of Stock</span>
          ) : isLowStock ? (
            <span className="badge badge-warning">Low Stock ({product.currentStock})</span>
          ) : null}
        </div>

        <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>
          {product.name}
        </h4>
        <p style={{ margin: "0 0 8px 0", fontSize: "0.75rem", color: "#64748b" }}>
          Unit: {product.unit || "kg"}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
        <div>
          <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
            ₹{product.price || product.sellingPrice || 0}
          </span>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}> / {product.unit || "kg"}</span>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={isOutOfStock}
          onClick={() => addToCart(product, 1)}
          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}
