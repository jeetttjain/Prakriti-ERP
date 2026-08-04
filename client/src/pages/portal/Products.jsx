import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerCartStore } from "../../store/customerCartStore";
import * as catalog from "../../services/productCatalogService";
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
 * ProductCard component — shows product info, stock status, and add-to-cart button.
 */
function ProductCard({ product, onAddToCart, onView }) {
  const isOOS = product.stockStatus === "Out Of Stock";
  const isLow = product.stockStatus === "Low Stock";

  return (
    <div className="cp-product-card" onClick={() => onView(product._id)}>
      <div className="cp-product-img">{getEmoji(product.category)}</div>
      <div className="cp-product-body">
        {product.priority !== "Normal" && (
          <span className={`cp-priority-tag ${product.priority === "Featured" ? "cp-priority-featured" : "cp-priority-popular"}`}>
            {product.priority}
          </span>
        )}
        <p className="cp-product-name">{product.productName}</p>
        <p className="cp-product-cat">{product.category}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span className="cp-product-price">{fmt(product.sellingPrice)}</span>
          <span className="cp-product-unit">/{product.unit}</span>
        </div>
        {isOOS && <p className="cp-product-oos">Out of Stock</p>}
        {!isOOS && isLow && <p className="cp-product-low">⚠ Low Stock</p>}
        <button
          className="cp-add-btn"
          disabled={isOOS}
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
        >
          {isOOS ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

/**
 * Product catalog page with category tabs, search, and responsive grid.
 * @component
 */
export default function Products() {
  const navigate = useNavigate();
  const { items, addItem } = useCustomerCartStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (search) params.search = search;
      const res = await catalog.getPortalProducts(params);
      const payload = res.data || res;
      setProducts(payload.products || []);
      setTotal(payload.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    catalog.getCategories().then((res) => {
      const cats = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      setCategories(cats);
    }).catch(() => {});
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <>
      <h1 className="cp-section-title" style={{ fontSize: "1rem", marginBottom: 12 }}>
        Shop {total > 0 && <span style={{ fontWeight: 400, fontSize: "0.75rem", color: "#6b7280" }}>({total} products)</span>}
      </h1>

      {/* Search */}
      <div className="cp-search-wrap">
        <span className="cp-search-icon">🔍</span>
        <input
          className="cp-search-input"
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Category tabs */}
      <div className="cp-category-tabs">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            className={`cp-category-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => { setActiveCategory(cat); }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading products…</div>
      ) : products.length === 0 ? (
        <div className="cp-empty"><div className="cp-empty-icon">🔍</div>No products found</div>
      ) : (
        <div className="cp-product-grid">
          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onView={(id) => navigate(`/portal/products/${id}`)}
              onAddToCart={(product) => addItem(product)}
            />
          ))}
        </div>
      )}

      {/* Floating cart button */}
      {cartCount > 0 && (
        <button className="cp-cart-fab" onClick={() => navigate(ROUTES.CUSTOMER_CART)}>
          🛒 View Cart
          <span className="cp-cart-fab-badge">{cartCount}</span>
        </button>
      )}
    </>
  );
}
