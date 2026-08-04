import React, { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../services/customerService";
import ProductCard from "../components/ProductCard";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Favorites() {
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    getFavorites().then((res) => setFavs(res.data || res || [])).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Favorite Items</h3>
      {favs.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>No favorite produce items saved yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
          {favs.map((item) => (
            <ProductCard key={item._id} product={item.productId || item} />
          ))}
        </div>
      )}
      <MobileBottomNav />
    </div>
  );
}
