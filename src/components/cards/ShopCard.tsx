import Link from "next/link";
import { ShopItem, SHOP_THEME_CYCLE } from "@/lib/data";

export default function ShopCard({ item }: { item: ShopItem }) {
  const sc = SHOP_THEME_CYCLE[item.id % SHOP_THEME_CYCLE.length];
  const isOut = item.status === "out";
  const onSale = !!item.sale && item.sale > 0;

  return (
    <div className={`shop3d-card ${sc}`} style={{ opacity: isOut ? 0.6 : 1 }}>
      <div className="shop3d-img">
        <div className="shop3d-emoji">{item.emoji}</div>
        <div className="shop3d-badge">
          {onSale && (
            <span className="bdg br2" style={{ fontSize: ".55rem" }}>
              🔥 SALE
            </span>
          )}
          {isOut && (
            <span
              className="bdg"
              style={{
                fontSize: ".55rem",
                background: "rgba(255,34,68,.15)",
                color: "#FF2244",
                borderColor: "rgba(255,34,68,.3)",
              }}
            >
              SOLD OUT
            </span>
          )}
        </div>
        <div className="shop3d-price-tag">
          {onSale ? `৳${item.sale}` : item.price ? `৳${item.price}` : ""}
        </div>
      </div>

      <div className="shop3d-body">
        <div className="shop3d-cat">{item.cat}</div>
        <div className="shop3d-name">{item.name}</div>
        <div className="shop3d-desc">{item.desc.substring(0, 70)}</div>
      </div>

      <div className="shop3d-foot">
        <div className="shop3d-prices">
          {onSale ? (
            <>
              <span className="shop3d-old">৳{item.price}</span>
              <span className="shop3d-sale-price">৳{item.sale}</span>
            </>
          ) : (
            <span className="shop3d-orig">৳{item.price || "0"}</span>
          )}
        </div>
        <Link
          className="shop3d-btn"
          href="/shop"
          aria-disabled={isOut}
          style={isOut ? { opacity: 0.5, pointerEvents: "none" } : undefined}
        >
          {isOut ? "Sold Out" : "🛒 Buy Now"}
        </Link>
      </div>
    </div>
  );
}
