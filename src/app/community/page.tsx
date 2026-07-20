// Phase 6 — Community directory (REQ-53): country pages with real player counts.
// Server Component; the flag emoji is derived from the ISO code.

import type { Metadata } from "next";
import Link from "next/link";
import { getCommunityCountries } from "@/lib/api";
import { EmptyState } from "@/components/system/Realtime";

export const metadata: Metadata = {
  title: "Community",
  description: "Country-based eBattleVerse communities — top players, active clubs, and cross-country battles.",
};
export const revalidate = 120;

function flagOf(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

export default async function CommunityPage() {
  const data = await getCommunityCountries().catch(() => ({ countries: [] }));

  return (
    <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 className="ht" style={{ fontSize: "2.2rem", marginBottom: ".4rem" }}>
          <span className="ac">COMMUNITY</span>
        </h1>
        <p className="hd" style={{ fontSize: ".8rem", marginBottom: "1.4rem" }}>
          Every country runs its own front. Find your people — then challenge another country&apos;s best.
        </p>

        {data.countries.length === 0 ? (
          <EmptyState
            icon="🌍"
            title="No national fronts yet"
            desc="Country pages light up as players register with their location. Yours could be first."
            action={<Link className="btn btn-lm btn-sm" href="/register">Represent your country →</Link>}
          />
        ) : (
          <div className="eb-sys-grid">
            {data.countries.map((c) => (
              <Link key={c.country_code} href={`/community/${c.country_code}`} className="eb-country-card">
                <span className="fl" aria-hidden>{flagOf(c.country_code)}</span>
                <span className="bd">
                  <b>{c.country}</b>
                  <span>{c.player_count} player{c.player_count === 1 ? "" : "s"}</span>
                </span>
                <span className="ar" aria-hidden>→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
