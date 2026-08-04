import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerCartStore } from "../../store/customerCartStore";
import * as catalog from "../../services/productCatalogService";
import * as orderService from "../../services/customerOrderService";
import { ROUTES } from "../../constants/routes";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const EMOJI_MAP = {
  Vegetables: "🥦", Fruits: "🍎", Leafy: "🥬", Greens: "🌿",
  Herbs: "🌿", Dairy: "🥛", Pulses: "🫘", Grains: "🌾",
};
const getEmoji = (cat) => {
  const k = Object.keys(EMOJI_MAP).find((k) => cat?.toLowerCase().includes(k.toLowerCase()));
  return k ? EMOJI_MAP[k] : "🛒";
};

/**
 * Single product detail page with add-to-cart and favorite toggle.
 * @component
 */
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addItem } = useCustomerCartStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const cartItem = items.find((i) => i.productId === id);

  useEffect(() => {
    catalog.getPortalProductById(id)
      .then((res) => {
        setProduct(res.data || res);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Check if already favorited
    orderService.getFavorites().then((res) => {
      const favs = res.data || res;
      const arr = Array.isArray(favs) ? favs : [];
      setIsFav(arr.some((f) => f.product?._id === id || f.productId === id));
    }).catch(() => {});
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleFavToggle = async () => {
    setFavLoading(true);
    try {
      if (isFav) {
        await orderService.removeFavorite(id);
        setIsFav(false);
      } else {
        await orderService.addFavorite(id);
        setIsFav(true);
      }
    } catch {}
    setFavLoading(false);
  };

  if (loading) return <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading…</div>;
  if (!product) return <div className="cp-empty"><div className="cp-empty-icon">❌</div>Product not found.</div>;

  const isOOS = product.stockStatus === "Out Of Stock";
  const isLow = product.stockStatus === "Low Stock";

  return (
    <>
      <button
        onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)}
        style={{ background: "none", border: "none", color: "#15803d", cursor: "pointer", marginBottom: 12, fontWeight: 600, fontSize: "0.85rem" }}
      >
        ← Back to Products
      </button>

      {/* Product image block */}
      <div style={{
        width: "100%", aspectRatio: "16/9", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "5rem", marginBottom: 16,
      }}>
        {getEmoji(product.category)}
      </div>

      <div className="cp-card" style={{ marginBottom: 12 }}>
        {/* Header row */}
        <div className="cp-card-row">
          <div>
            {product.priority !== "Normal" && (
              <span className={`cp-priority-tag ${product.priority === "Featured" ? "cp-priority-featured" : "cp-priority-popular"}`}>
                {product.priority}
              </span>
            )}
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827", margin: "4px 0 2px" }}>
              {product.productName}
            </h2>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>{product.category} · {product.unit}</p>
          </div>
          <button className={`cp-fav-btn ${isFav ? "active" : ""}`} onClick={handleFavToggle} disabled={favLoading} title="Favourite">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={isFav ? "#dc2626" : "none"} stroke={isFav ? "#dc2626" : "#94a3b8"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Price and stock */}
        <div style={{ marginTop: 14 }}>
          <span style={{ fontSize: "1.6rem", fontWeight: 900, color: "#15803d" }}>{fmt(product.sellingPrice)}</span>
          <span style={{ fontSize: "0.8rem", color: "#6b7280", marginLeft: 4 }}>per {product.unit}</span>
        </div>
        {isOOS && <p className="cp-product-oos" style={{ marginTop: 6 }}>❌ Out of Stock</p>}
        {!isOOS && isLow && <p className="cp-product-low" style={{ marginTop: 6 }}>⚠ Low Stock — {product.availableStock} {product.unit} left</p>}
        {!isOOS && !isLow && (
          <p style={{ fontSize: "0.7rem", color: "#15803d", marginTop: 6 }}>✓ In Stock</p>
        )}
      </div>

      {/* Add to cart section */}
      {!isOOS && (
        <div className="cp-card" style={{ marginBottom: 12 }}>
          <p className="cp-section-title" style={{ marginBottom: 12 }}>Quantity</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="cp-qty-row">
              <button className="cp-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <div className="cp-qty-num">{qty}</div>
              <button
                className="cp-qty-btn"
                onClick={() => setQty((q) => Math.min(q + 1, product.availableStock ?? 999))}
              >+</button>
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151" }}>
              = {fmt(product.sellingPrice * qty)}
            </span>
          </div>
          <button className="cp-add-btn" style={{ marginTop: 14 }} onClick={handleAdd}>
            {added ? "✓ Added to Cart!" : cartItem ? `Update Cart (${cartItem.quantity} in cart)` : "Add to Cart 🛒"}
          </button>
        </div>
      )}

      {/* Floating cart */}
      {cartCount > 0 && (
        <button className="cp-cart-fab" onClick={() => navigate(ROUTES.CUSTOMER_CART)}>
          🛒 View Cart <span className="cp-cart-fab-badge">{cartCount}</span>
        </button>
      )}
    </>
  );
}
