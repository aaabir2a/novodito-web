import Link from "next/link";
import ShopCard from "@/components/cards/ShopCard";
import HeroOps, { type OpsLadderRow, type OpsTournament } from "@/components/home/HeroOps";
import {
  FeatureGrid,
  SectionHead,
  TournamentMini,
  LadderColumn,
  TopClubs,
  NationalFronts,
} from "@/components/home/HomeSections";
import {
  getTournaments,
  getLeaderboardPreview,
  getHomeStats,
  getClubs,
  getCommunityCountries,
  type ApiTournament,
  type ClubListItem,
  type CountryEntry,
  type LeaderboardRow,
} from "@/lib/api";
import { shopItems, tickerItems } from "@/lib/data";

export const revalidate = 60;

// Home is a live hub: every feature phase gets a real-data surface. All source
// endpoints are public; each is settled independently so one outage never
// blanks the page.
async function getHomeData() {
  const [tRes, lbRes, hsRes, clubRes, ctryRes] = await Promise.allSettled([
    getTournaments({ limit: 20 }),
    getLeaderboardPreview(),
    getHomeStats(),
    getClubs(),
    getCommunityCountries(),
  ]);

  const tournaments: ApiTournament[] = tRes.status === "fulfilled" ? tRes.value.tournaments : [];
  const homeStats = hsRes.status === "fulfilled" ? hsRes.value : null;
  const clubs: ClubListItem[] = clubRes.status === "fulfilled" ? clubRes.value.clubs : [];
  const countries: CountryEntry[] = ctryRes.status === "fulfilled" ? ctryRes.value.countries : [];
  const soloTop: LeaderboardRow[] = lbRes.status === "fulfilled" ? lbRes.value.solo_identity_top5 : [];
  const clubTop: LeaderboardRow[] = lbRes.status === "fulfilled" ? lbRes.value.club_match_top5 : [];

  const openTournaments = tournaments
    .filter((t) => t.status === "Registration" && t.starts_at)
    .sort((a, b) => new Date(a.starts_at!).getTime() - new Date(b.starts_at!).getTime());

  const next: OpsTournament | null = openTournaments[0]
    ? {
        id: openTournaments[0].id,
        name: openTournaments[0].name,
        mode: openTournaments[0].mode,
        max_slots: openTournaments[0].max_slots,
        filled_slots: openTournaments[0].filled_slots,
        entry_fee_bdt: openTournaments[0].entry_fee_bdt,
        prize_pool_bdt: openTournaments[0].prize_pool_bdt,
        status: openTournaments[0].status,
        starts_at: openTournaments[0].starts_at,
      }
    : null;

  const heroLadder: OpsLadderRow[] = soloTop.slice(0, 3);
  const prizeTotal = tournaments.reduce((s, t) => s + (t.prize_pool_bdt || 0), 0);

  return {
    next,
    heroLadder,
    tournaments: (openTournaments.length ? openTournaments : tournaments).slice(0, 4),
    soloTop,
    clubTop,
    clubs,
    countries,
    homeStats,
    eventCount: tournaments.length,
    prizeTotal,
  };
}

export default async function HomePage() {
  const d = await getHomeData();
  const homeShop = shopItems.filter((i) => i.status === "active").slice(0, 4);
  const ticker = [...tickerItems, ...tickerItems];
  const prizeLabel =
    d.prizeTotal >= 100000
      ? `৳${(d.prizeTotal / 100000).toFixed(1).replace(/\.0$/, "")}L`
      : `৳${d.prizeTotal.toLocaleString()}`;

  return (
    <div className="page act" id="page-home">
      {/* ── COMMAND DECK HERO ── */}
      <section className="eb-hero">
        <div className="eb-hero-bg" aria-hidden />
        <div className="eb-hero-in">
          <div className="eb-hero-copy">
            <div className="eb-hero-kick">
              <span className="bk" aria-hidden />
              OFFICIAL KONAMI eFOOTBALL PARTNER · BANGLADESH 2026
            </div>
            <h1 className="eb-hero-h1">
              ENTER THE
              <br />
              <span className="ac">eBATTLE</span><span className="go">VERSE</span>
            </h1>
            <p className="eb-hero-sub">
              Ranked ladders, coin-staked challenges, club wars and LAN finals —
              one competitive universe for Bangladesh&apos;s eFootball players.
              Every score referee-verified. Every match counts.
            </p>
            <div className="eb-hero-ctas">
              <Link className="btn btn-lm" href="/register">⚡ Start Competing</Link>
              <Link className="btn btn-gh" href="/live">▶ Watch Live</Link>
            </div>
            <ul className="eb-hero-trust">
              <li>✔ Konami partner</li>
              <li>🛡 Referee-verified scores</li>
              <li>💳 bKash payments</li>
            </ul>
            <div className="eb-hero-stats">
              <div><b>{d.eventCount || 6}</b><span>Season Events</span></div>
              <div><b>{prizeLabel}</b><span>Prize Pool</span></div>
              <div><b>{d.homeStats?.total_players ?? "2K+"}</b><span>Players</span></div>
              <div className="reg"><b>● OPEN</b><span>Registration</span></div>
            </div>
          </div>

          <HeroOps tournament={d.next} ladder={d.heroLadder} />
        </div>
      </section>

      {/* TICKER */}
      <div className="tk-w">
        <div className="tk-tr">
          {ticker.map((t, i) => (
            <div className="tk-i" key={i}>
              <span className="tk-d" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="wrap" style={{ padding: "0 1.8rem 4rem" }}>
        {/* QUICK STATS */}
        <div className="qstats rv" style={{ marginTop: "2.5rem" }}>
          <div className="qstat-item">
            <div className="qstat-n">{d.homeStats?.total_players ?? "2K+"}</div>
            <div className="qstat-l">Registered Players</div>
          </div>
          <div className="qstat-item">
            <div className="qstat-n">{d.eventCount || 6}</div>
            <div className="qstat-l">Season Events</div>
          </div>
          <div className="qstat-item">
            <div className="qstat-n">{prizeLabel}</div>
            <div className="qstat-l">Total Prize Pool</div>
          </div>
          <div className="qstat-item">
            <div className="qstat-n">{d.homeStats?.total_countries || d.countries.length || 1}</div>
            <div className="qstat-l">Countries</div>
          </div>
        </div>

        {/* EXPLORE THE VERSE — feature directory */}
        <div className="rv" style={{ marginTop: "2.6rem" }}>
          <SectionHead icon="🎮" title="EXPLORE THE VERSE" alt="🌐" />
          <FeatureGrid />
        </div>

        {/* UPCOMING TOURNAMENTS (real) */}
        <div className="rv" style={{ marginTop: "2.6rem" }}>
          <SectionHead icon="🏆" title="UPCOMING TOURNAMENTS" href="/tournaments" cta="All tournaments →" />
          {d.tournaments.length === 0 ? (
            <p className="hd">Season calendar is being finalized — check back soon.</p>
          ) : (
            <div className="eb-tmini-grid">
              {d.tournaments.map((t) => <TournamentMini key={t.id} t={t} />)}
            </div>
          )}
        </div>

        {/* TOP RANKED (real dual ladder) */}
        <div className="rv" style={{ marginTop: "2.6rem" }}>
          <SectionHead icon="👑" title="TOP RANKED" alt="⚔️" href="/rankings" cta="Full rankings →" />
          <div className="eb-home-2col">
            <LadderColumn title="Solo Identity — Global" rows={d.soloTop} href="/rankings" />
            <LadderColumn title="Club Match — National" rows={d.clubTop} href="/rankings" />
          </div>
        </div>

        {/* CLUBS + COMMUNITY (real) */}
        <div className="rv" style={{ marginTop: "2.6rem" }}>
          <SectionHead icon="🛡️" title="CLUBS & COMMUNITY" alt="🌍" />
          <div className="eb-home-2col">
            <TopClubs clubs={d.clubs} />
            <NationalFronts countries={d.countries} />
          </div>
        </div>

        {/* LIVE TEASER (P4) */}
        <div className="rv eb-live-teaser" style={{ marginTop: "2.6rem" }}>
          <div className="tx">
            <span className="eb-status live" style={{ marginBottom: ".6rem" }}>📡 Live Arena</span>
            <h3>Watch matches live — and earn while you do</h3>
            <p>
              Player streams, referee-POV coverage, club raids and auto-clipped
              highlights. Spectators earn Battle Coins for watch time.
            </p>
          </div>
          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap" }}>
            <Link className="btn btn-lm" href="/live">▶ Open Live Arena</Link>
            <Link className="btn btn-gh" href="/shorts">🎬 Browse Shorts</Link>
          </div>
        </div>

        {/* REGISTER CTA BAND */}
        <div className="cta-band rv" style={{ marginTop: "2.6rem" }}>
          <div className="cta-band-text">
            <h3>⚽ READY TO COMPETE IN 2026?</h3>
            <p>
              Pick your platform, claim your rank, join a club. Registration is
              open now — bKash entry, all skill levels welcome.
            </p>
          </div>
          <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap" }}>
            <Link className="btn btn-lm" href="/register">Register Now →</Link>
            <Link className="btn btn-gh" href="/rankings">📊 View Rankings</Link>
          </div>
        </div>

        {/* STORE PREVIEW */}
        <div className="shop-preview rv" style={{ marginTop: "2.6rem" }}>
          <SectionHead icon="🛒" title="OFFICIAL STORE" alt="👕" href="/shop" cta="Browse shop →" />
          <div className="sp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.3rem" }}>
            {homeShop.map((item) => <ShopCard key={item.id} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
