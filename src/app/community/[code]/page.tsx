// Phase 6 — Country page (REQ-53): Top 10 players, active clubs, upcoming
// fixtures, and the cross-country challenge CTA.

import Link from "next/link";
import { getCommunityCountry } from "@/lib/api";
import IdentityChip from "@/components/system/IdentityChip";
import { EmptyState } from "@/components/system/Realtime";

export const revalidate = 120;

function flagOf(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}
const CROWNS: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🥉" };

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getCommunityCountry(code).catch(() => null);

  if (!data) {
    return (
      <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <EmptyState icon="🌍" title="Country unavailable"
            action={<Link className="btn btn-lm btn-sm" href="/community">← All countries</Link>} />
        </div>
      </div>
    );
  }

  const top = data.top_players;
  const champion = top[0];

  return (
    <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 950, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
          <span style={{ fontSize: "3rem" }} aria-hidden>{flagOf(data.country_code)}</span>
          <div style={{ flex: 1 }}>
            <h1 className="ht" style={{ fontSize: "2rem" }}><span className="ac">{data.country.toUpperCase()}</span></h1>
            <p className="hd" style={{ fontSize: ".78rem" }}>{data.player_count} registered player{data.player_count === 1 ? "" : "s"}</p>
          </div>
          {champion ? (
            <Link className="btn btn-gd" href={`/players/${champion.player_id}`}>
              ⚔️ Challenge {data.country}&apos;s #1
            </Link>
          ) : null}
        </div>

        <div className="eb-pf-grid">
          <section className="eb-pf-card">
            <h3>Top 10 — Solo ladder</h3>
            {top.length === 0 ? (
              <EmptyState icon="🏆" title="No ranked players yet" />
            ) : (
              <ol className="eb-lb">
                {top.map((p) => (
                  <li key={p.player_id} className="eb-lb-row">
                    <span className="eb-lb-rank">{CROWNS[p.rank] ?? `#${p.rank}`}</span>
                    <Link href={`/players/${p.player_id}`} className="eb-lb-id">
                      <IdentityChip name={p.username} avatarUrl={p.profile_photo_url} size="sm" />
                    </Link>
                    <span className="eb-lb-pts" style={{ fontSize: ".9rem" }}>{p.rank_points} pts</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="eb-pf-card">
            <h3>Active clubs</h3>
            {data.clubs.length === 0 ? (
              <EmptyState icon="🛡️" title="No clubs yet" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                {data.clubs.map((c) => (
                  <Link key={c.id} href={`/clubs/${c.id}`} className="eb-club-member">
                    <span>🛡️ {c.name}</span>
                    <span className="ct">{c.rank_points} pts</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="eb-pf-card wide">
            <h3>Upcoming fixtures</h3>
            {data.upcoming_fixtures.length === 0 ? (
              <EmptyState icon="📅" title="No scheduled matches" desc="National fixtures appear here as matches get scheduled." />
            ) : (
              <table className="eb-pf-table">
                <thead><tr><th>Type</th><th>Match</th><th>When</th></tr></thead>
                <tbody>
                  {data.upcoming_fixtures.map((f) => (
                    <tr key={f.id}>
                      <td>{f.type}</td>
                      <td>{f.player_a_username ?? "TBD"} vs {f.player_b_username ?? "TBD"}</td>
                      <td>{f.scheduled_at ? new Date(f.scheduled_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "TBD"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
