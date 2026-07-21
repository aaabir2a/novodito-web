// Home hub sections (Server Components, presentational). Every feature phase
// gets a real-data surface + a clear entry point. Design language matches the
// feature pages (eb-* system, IdentityChip) so the home reads as one product.

import Link from "next/link";
import IdentityChip from "@/components/system/IdentityChip";
import type { ApiTournament, ClubListItem, CountryEntry, LeaderboardRow } from "@/lib/api";

/* Section header — reuses the existing HUD strip. */
export function SectionHead({ icon, title, alt = "⚽", href, cta }: { icon: string; title: string; alt?: string; href?: string; cta?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
      <div className="section-strip" style={{ flex: 1, minWidth: 220, margin: 0 }}>
        <div className="section-strip-line" />
        <span className="section-strip-icon">{icon}</span>
        <div className="section-strip-title">{title}</div>
        <span className="section-strip-icon">{alt}</span>
        <div className="section-strip-line r" />
      </div>
      {href && cta ? (
        <Link className="btn btn-gh btn-sm" href={href} style={{ flexShrink: 0 }}>{cta}</Link>
      ) : null}
    </div>
  );
}

/* ── Feature directory (reachability + wayfinding) ── */
const FEATURES: { icon: string; title: string; desc: string; href: string; tag?: string }[] = [
  { icon: "🏆", title: "Tournaments", desc: "Regional & LAN brackets, live slots", href: "/tournaments" },
  { icon: "📊", title: "Rankings", desc: "Solo & club ladders, seasons", href: "/rankings" },
  { icon: "⚽", title: "Match Centre", desc: "Upcoming, live & completed", href: "/matches" },
  { icon: "📡", title: "Live", desc: "Streams, referee POV, watch-to-earn", href: "/live", tag: "SOON" },
  { icon: "🛡️", title: "Clubs", desc: "Rosters, contracts, 8-arena matches", href: "/clubs" },
  { icon: "⚔️", title: "Club Wars", desc: "Multi-day 5v5 rivalries", href: "/wars" },
  { icon: "🌍", title: "Community", desc: "Country fronts & cross-border battles", href: "/community" },
  { icon: "🎬", title: "Shorts", desc: "Goal highlights & community clips", href: "/shorts" },
  { icon: "🎨", title: "Card Studio", desc: "Customize your player card", href: "/studio" },
  { icon: "🪙", title: "Wallet", desc: "Battle & S Coins, P2P transfers", href: "/wallet" },
  { icon: "📰", title: "News", desc: "Announcements & season updates", href: "/news" },
  { icon: "🛒", title: "Shop", desc: "Official merch & cosmetics", href: "/shop" },
];

export function FeatureGrid() {
  return (
    <div className="eb-feat-grid">
      {FEATURES.map((f) => (
        <Link key={f.href} href={f.href} className="eb-feat-card">
          <span className="ic" aria-hidden>{f.icon}</span>
          <span className="bd">
            <b>{f.title}{f.tag ? <em className="tag">{f.tag}</em> : null}</b>
            <span>{f.desc}</span>
          </span>
          <span className="ar" aria-hidden>→</span>
        </Link>
      ))}
    </div>
  );
}

/* ── Tournament mini card (real data) ── */
const bdt = (n: number) => (n >= 100000 ? `৳${(n / 100000).toFixed(1).replace(/\.0$/, "")}L` : `৳${n.toLocaleString()}`);

export function TournamentMini({ t }: { t: ApiTournament }) {
  const pct = t.max_slots ? Math.min((t.filled_slots / t.max_slots) * 100, 100) : 0;
  const when = t.starts_at ? new Date(t.starts_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "TBD";
  return (
    <Link href={`/tournaments/${t.id}`} className="eb-tmini">
      <div className="top">
        <span className={`eb-status ${t.status === "Registration" ? "verified" : "neutral"}`}>{t.status === "Registration" ? "REG OPEN" : t.status}</span>
        <span className="mode">{t.mode}</span>
      </div>
      <div className="nm">{t.name}</div>
      <div className="bar" aria-hidden><span style={{ width: `${pct}%` }} /></div>
      <div className="ft">
        <span>{t.filled_slots}/{t.max_slots} slots</span>
        <span className="pz">{bdt(t.prize_pool_bdt)}</span>
      </div>
      <div className="ft2">
        <span>Starts {when}</span>
        <span>Entry {bdt(t.entry_fee_bdt)}</span>
      </div>
    </Link>
  );
}

/* ── Ladder column (real leaderboard) ── */
const CROWN: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🥉" };

export function LadderColumn({ title, rows, href }: { title: string; rows: LeaderboardRow[]; href: string }) {
  return (
    <div className="eb-pf-card">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="hd" style={{ fontSize: ".8rem" }}>No ranked players yet — be the first.</p>
      ) : (
        <ol className="eb-lb" style={{ gap: ".35rem" }}>
          {rows.slice(0, 5).map((r) => (
            <li key={r.player_id} className={`eb-lb-row${(r.crown?.toLowerCase() === "gold") ? " gold" : ""}`} style={{ padding: ".4rem .6rem" }}>
              <span className="eb-lb-rank" style={{ width: 32 }}>{CROWN[r.rank] ?? `#${r.rank}`}</span>
              <Link href={`/players/${r.player_id}`} className="eb-lb-id">
                <IdentityChip name={r.username} avatarUrl={r.profile_photo_url} clubName={r.club_name} size="sm" elite={r.crown?.toLowerCase() === "gold"} />
              </Link>
              <span className="eb-lb-pts" style={{ fontSize: ".85rem" }}>{r.rank_points}</span>
            </li>
          ))}
        </ol>
      )}
      <Link className="eb-ops-more" href={href}>View full board →</Link>
    </div>
  );
}

/* ── Top clubs (real) ── */
export function TopClubs({ clubs }: { clubs: ClubListItem[] }) {
  return (
    <div className="eb-pf-card">
      <h3>Top Clubs</h3>
      {clubs.length === 0 ? (
        <p className="hd" style={{ fontSize: ".8rem" }}>No clubs yet — found the first.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
          {clubs.slice(0, 5).map((c, i) => (
            <Link key={c.id} href={`/clubs/${c.id}`} className="eb-club-member">
              <span style={{ display: "flex", alignItems: "center", gap: ".5rem", minWidth: 0 }}>
                <span className="eb-club-emblem sm">{c.emblem_url ? null : c.name.charAt(0).toUpperCase()}</span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>#{i + 1} {c.name}</span>
              </span>
              <span className="ct">{c.rank_points} pts</span>
            </Link>
          ))}
        </div>
      )}
      <Link className="eb-ops-more" href="/clubs">All clubs →</Link>
    </div>
  );
}

/* ── National fronts (real countries) ── */
function flagOf(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

export function NationalFronts({ countries }: { countries: CountryEntry[] }) {
  return (
    <div className="eb-pf-card">
      <h3>National Fronts</h3>
      {countries.length === 0 ? (
        <p className="hd" style={{ fontSize: ".8rem" }}>Register with your location to open your country&apos;s front.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
          {countries.slice(0, 5).map((c) => (
            <Link key={c.country_code} href={`/community/${c.country_code}`} className="eb-club-member">
              <span style={{ display: "flex", alignItems: "center", gap: ".55rem" }}>
                <span style={{ fontSize: "1.3rem" }}>{flagOf(c.country_code)}</span>
                {c.country}
              </span>
              <span className="ct">{c.player_count} players</span>
            </Link>
          ))}
        </div>
      )}
      <Link className="eb-ops-more" href="/community">Explore community →</Link>
    </div>
  );
}
