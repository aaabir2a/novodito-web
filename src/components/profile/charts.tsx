// Profile visualizations — pure SVG/CSS, no chart libs.
// FormGrid (FR-032), RatingsBars (FR-033), RadarChart (FR-035), StatTile.

import type { FormMatch, RatingEntry } from "@/lib/api";
import { EmptyState } from "@/components/system/Realtime";

/* ── FR-032: last-50 form grid — colored circles + running streak ── */
export function FormGrid({
  matches,
  streak,
}: {
  matches: FormMatch[];
  streak: number;
}) {
  if (matches.length === 0) {
    return (
      <EmptyState
        icon="🎯"
        title="No matches yet"
        desc="Every match will show up here as a colored node — green wins, red losses, grey draws."
      />
    );
  }
  return (
    <div>
      <div className="eb-form-grid">
        {matches.slice(0, 50).map((m, i) => (
          <span
            key={i}
            className={`eb-form-dot ${m.result.toLowerCase()}`}
            title={`${m.result} ${m.score} vs ${m.opponent_username}`}
          >
            {m.score}
          </span>
        ))}
      </div>
      {streak > 0 ? (
        <div className="eb-form-streak">
          🔥 <b>{streak}</b> match unbeaten run
        </div>
      ) : null}
    </div>
  );
}

/* ── FR-033: last-10 ratings bars with opponent photos under each bar ── */
export function RatingsBars({ ratings }: { ratings: RatingEntry[] }) {
  if (ratings.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No ratings yet"
        desc="Match ratings out of 10 appear here after your first fixtures."
      />
    );
  }
  const last10 = ratings.slice(0, 10);
  return (
    <div className="eb-ratings">
      {last10.map((r, i) => (
        <div key={i} className="eb-rating-col" title={`${r.match_rating}/10`}>
          <span className="eb-rating-val">{r.match_rating.toFixed(1)}</span>
          <span
            className={`eb-rating-bar${r.match_rating >= 7 ? " hi" : r.match_rating < 5 ? " lo" : ""}`}
            style={{ height: `${Math.max(r.match_rating * 10, 4)}%` }}
          />
          <span className="eb-rating-face">
            {r.opponent_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.opponent_photo_url} alt="" loading="lazy" />
            ) : (
              "👤"
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── FR-035: five-axis radar (SVG pentagon) ── */
const AXES: { key: string; label: string }[] = [
  { key: "passing_precision", label: "Passing" },
  { key: "shooting_accuracy", label: "Shooting" },
  { key: "defensive_contrib", label: "Defense" },
  { key: "possession_retention", label: "Possession" },
  { key: "physical_stamina", label: "Stamina" },
];

export function RadarChart({
  values,
  positionLabel,
}: {
  values: Record<string, number> | null;
  positionLabel?: string;
}) {
  if (!values) {
    return (
      <EmptyState
        icon="🕸️"
        title="Not enough match data"
        desc="Play at least 5 matches to unlock your tactical radar and position analysis."
      />
    );
  }
  const cx = 110, cy = 105, R = 78;
  const point = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = (frac: number) =>
    AXES.map((_, i) => point(i, R * frac).map((n) => n.toFixed(1)).join(",")).join(" ");
  const dataPoly = AXES.map((ax, i) =>
    point(i, (R * Math.min(Math.max(values[ax.key] ?? 0, 0), 100)) / 100)
      .map((n) => n.toFixed(1))
      .join(","),
  ).join(" ");

  return (
    <div className="eb-radar-wrap">
      <svg viewBox="0 0 220 210" role="img" aria-label="Tactical radar chart">
        {[0.33, 0.66, 1].map((f) => (
          <polygon key={f} points={ring(f)} fill="none" stroke="rgba(57,211,83,.18)" strokeWidth="1" />
        ))}
        {AXES.map((_, i) => {
          const [x, y] = point(i, R);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,.08)" />;
        })}
        <polygon points={dataPoly} fill="rgba(57,211,83,.25)" stroke="var(--lime)" strokeWidth="2" strokeLinejoin="round" />
        {AXES.map((ax, i) => {
          const [x, y] = point(i, R + 16);
          return (
            <text key={ax.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              style={{ fill: "rgba(190,210,195,.75)", fontSize: 9, fontFamily: "var(--fo)", letterSpacing: ".08em", textTransform: "uppercase" }}>
              {ax.label}
            </text>
          );
        })}
      </svg>
      {positionLabel ? (
        <div className="eb-radar-pos">
          Optimal position: <b>{positionLabel}</b>
        </div>
      ) : null}
    </div>
  );
}

/* ── Large-format stat tile (FR-025, FR-038) ── */
export function StatTile({ label, value, accent }: { label: string; value: string | number; accent?: "gold" | "lime" }) {
  return (
    <div className={`eb-stat-tile${accent ? ` ${accent}` : ""}`}>
      <span className="v">{value}</span>
      <span className="l">{label}</span>
    </div>
  );
}
