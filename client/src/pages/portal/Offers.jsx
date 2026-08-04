import { useEffect, useState } from "react";
import * as catalog from "../../services/productCatalogService";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null;

const discountLabel = (offer) => {
  if (offer.discountType === "Percentage") return `${offer.discountValue}% OFF`;
  if (offer.discountType === "Flat") return `₹${offer.discountValue} OFF`;
  return "Special Offer";
};

/**
 * Offers page — displays active promotional banners from the backend.
 * @component
 */
export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalog.getOffers()
      .then((res) => {
        const data = res.data || res;
        setOffers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading…</div>;

  return (
    <>
      <h1 className="cp-section-title" style={{ fontSize: "1rem", marginBottom: 14 }}>Current Offers</h1>

      {offers.length === 0 ? (
        <div className="cp-empty">
          <div className="cp-empty-icon">🎁</div>
          No active offers at the moment.
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 }}>
            Check back soon for exclusive deals!
          </p>
        </div>
      ) : (
        offers.map((offer) => (
          <div key={offer._id} className="cp-offer-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p className="cp-offer-title">{offer.title}</p>
              <span className="cp-offer-badge">{discountLabel(offer)}</span>
            </div>
            {offer.description && <p className="cp-offer-desc">{offer.description}</p>}
            {offer.applicableCategory && (
              <span className="cp-offer-badge" style={{ marginRight: 6 }}>
                📦 {offer.applicableCategory}
              </span>
            )}
            {offer.validUntil && (
              <p className="cp-offer-valid">Valid until {fmtDate(offer.validUntil)}</p>
            )}
          </div>
        ))
      )}

      {/* Placeholder when no backend offers */}
      {offers.length === 0 && (
        <>
          {[
            { title: "Fresh Arrivals", desc: "New seasonal vegetables available every morning.", badge: "Today" },
            { title: "Bulk Order Discount", desc: "Order above ₹2,000 and get special pricing. Contact your manager.", badge: "On Request" },
            { title: "Loyalty Benefits", desc: "Regular customers receive priority delivery slots and price stability.", badge: "Members" },
          ].map((promo, i) => (
            <div key={i} className="cp-offer-card" style={{ opacity: 0.7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p className="cp-offer-title">{promo.title}</p>
                <span className="cp-offer-badge">{promo.badge}</span>
              </div>
              <p className="cp-offer-desc">{promo.desc}</p>
            </div>
          ))}
        </>
      )}
    </>
  );
}
