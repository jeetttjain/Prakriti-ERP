import React, { useEffect, useState } from "react";
import { useCustomerStore } from "../store/customerStore";
import ProductCard from "../components/ProductCard";
import CategoryTabs from "../components/CategoryTabs";
import LoadingSkeleton from "../components/LoadingSkeleton";
import MobileBottomNav from "../components/MobileBottomNav";
import OfflineBanner from "../components/OfflineBanner";

export default function Products() {
  const { products, categories, loading, fetchProducts, fetchCategories } = useCustomerStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ paddingBottom: "80px" }}>
      <OfflineBanner />

      <div style={{ padding: "16px 16px 8px 16px", background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", fontWeight: "700" }}>Fresh Produce Menu</h3>
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search vegetables, fruits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={{ padding: "16px" }}>
        <CategoryTabs categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

        {loading ? (
          <LoadingSkeleton cards={6} />
        ) : filteredProducts.length === 0 ? (
          <p style={{ color: "#64748b", fontStyle: "italic", fontSize: "0.85rem" }}>No products match your search.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            {filteredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
