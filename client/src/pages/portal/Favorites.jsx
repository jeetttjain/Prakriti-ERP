import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerCartStore } from "../../store/customerCartStore";
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
 * Favourites page — shows saved products with add-to-cart and remove favourite actions.
 * @component
 */
export default function Favorites() {
  const navigate = useNavigate();
  const { addItem } = useCustomerCartStore();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [added, setAdded] = useState(null);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await orderService.getFavorites();
      const data = res.data || res;
      setFavorites(Array.isArray(data) ? data : []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFavorites(); }, []);

  const handleRemove = async (productId) => {
    setRemoving(productId);
    try {
      await orderService.removeFavorite(productId);
      setFavorites((prev) => prev.filter((f) => f.product?._id !== productId));
    } catch {}
    setRemoving(null);
  };

  const handleAddToCart = (fav) => {
    if (!fav.product) return;
    addItem(fav.product);
    setAdded(fav.product._id);
    setTimeout(() => setAdded(null), 1200);
  };

  if (loading) return <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading…</div>;

  return (
    <>
      <h1 className="cp-section-title" style={{ fontSize: "1rem", marginBottom: 14 }}>
        My Favourites ({favorites.length})
      </h1>

      {favorites.length === 0 ? (
        <div className="cp-empty">
          <div className="cp-empty-icon">❤️</div>
          No favourites yet
          <br />
          <button
            className="cp-add-btn"
            style={{ maxWidth: 200, margin: "14px auto 0", display: "block" }}
            onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="cp-product-grid">
          {favorites.map((fav) => {
            const p = fav.product;
            if (!p) return null;
            const isOOS = p.stockStatus === "Out Of Stock";
            return (
              <div key={fav._id} className="cp-product-card">
                <div
                  className="cp-product-img"
                  onClick={() => navigate(`/portal/products/${p._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {getEmoji(p.category)}
                </div>
                <div className="cp-product-body">
                  <p className="cp-product-name">{p.productName}</p>
                  <p className="cp-product-cat">{p.category}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="cp-product-price">{fmt(p.sellingPrice)}</span>
                    <button
                      className="cp-fav-btn active"
                      disabled={removing === p._id}
                      onClick={() => handleRemove(p._id)}
                      title="Remove from favourites"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626" stroke="#dc2626" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  {isOOS && <p className="cp-product-oos">Out of Stock</p>}
                  <button
                    className="cp-add-btn"
                    disabled={isOOS}
                    onClick={() => handleAddToCart(fav)}
                  >
                    {added === p._id ? "✓ Added!" : isOOS ? "Unavailable" : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
