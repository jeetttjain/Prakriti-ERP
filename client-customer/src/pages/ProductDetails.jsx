import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/customerService";
import { useCustomerStore } from "../store/customerStore";
import MobileBottomNav from "../components/MobileBottomNav";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCustomerStore();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    getProductById(id).then((res) => setProduct(res.data || res)).catch(() => {});
  }, [id]);

  if (!product) return <div style={{ padding: "20px" }}>Loading product details...</div>;

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>← Back</button>

      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#16a34a" }}>{product.category}</span>
        <h2 style={{ margin: "4px 0 8px 0" }}>{product.name}</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>{product.description || "Fresh farm produce delivered daily."}</p>

        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: "16px 0" }}>
          ₹{product.price || product.sellingPrice || 0} / {product.unit || "kg"}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
          <span>Quantity:</span>
          <button type="button" className="btn btn-secondary" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
          <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>{qty}</span>
          <button type="button" className="btn btn-secondary" onClick={() => setQty(qty + 1)}>+</button>
        </div>

        <button type="button" className="btn btn-primary" style={{ width: "100%", padding: "14px" }} onClick={() => { addToCart(product, qty); navigate("/cart"); }}>
          + Add to Cart (₹{(product.price || product.sellingPrice || 0) * qty})
        </button>
      </div>

      <MobileBottomNav />
    </div>
  );
}
