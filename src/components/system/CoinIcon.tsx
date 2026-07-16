// REQ-41 — Coin Visual Identity. Two instantly distinguishable 3D glowing coins:
//   Battle Coin (competitive) = gold/ember disc with a strike bolt
//   S Coin     (cosmetic)     = cyan/violet disc with an orbit ring + star
// Inline SVG so size/glow scale cleanly anywhere (wallet, shop, chat, toasts).

export type CoinType = "battle" | "s";

export default function CoinIcon({
  type,
  size = 18,
  glow = true,
  title,
}: {
  type: CoinType;
  size?: number;
  glow?: boolean;
  title?: string;
}) {
  const label = title ?? (type === "battle" ? "Battle Coins" : "S Coins");
  const style = glow
    ? {
        filter:
          type === "battle"
            ? "drop-shadow(0 0 4px rgba(255,184,0,.7))"
            : "drop-shadow(0 0 4px rgba(125,232,255,.7))",
      }
    : undefined;

  if (type === "battle") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={label} style={style}>
        <defs>
          <radialGradient id="bcFace" cx="35%" cy="30%" r="80%">
            <stop offset="0" stopColor="#FFF0A0" />
            <stop offset=".55" stopColor="#FFB800" />
            <stop offset="1" stopColor="#B87400" />
          </radialGradient>
          <linearGradient id="bcRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE066" />
            <stop offset="1" stopColor="#8A5600" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#bcRim)" />
        <circle cx="32" cy="32" r="25" fill="url(#bcFace)" stroke="#7A4B00" strokeWidth="1.5" />
        <polygon
          points="37,14 22,35 30,35 26,50 42,28 33,28"
          fill="#5C3A00"
          stroke="#FFF0A0"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={label} style={style}>
      <defs>
        <radialGradient id="scFace" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#D8F9FF" />
          <stop offset=".55" stopColor="#39C6E8" />
          <stop offset="1" stopColor="#4B2E9E" />
        </radialGradient>
        <linearGradient id="scRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FEFFF" />
          <stop offset="1" stopColor="#3A1F7A" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#scRim)" />
      <circle cx="32" cy="32" r="25" fill="url(#scFace)" stroke="#2A1866" strokeWidth="1.5" />
      <ellipse cx="32" cy="32" rx="27" ry="9" fill="none" stroke="#BF5FFF" strokeWidth="2.2" opacity=".85" transform="rotate(-20 32 32)" />
      <path
        d="M32 20l3.2 7.1 7.8.8-5.9 5.2 1.7 7.6L32 36.8l-6.8 3.9 1.7-7.6-5.9-5.2 7.8-.8z"
        fill="#1A0E4D"
        stroke="#D8F9FF"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
