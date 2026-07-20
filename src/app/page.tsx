import Link from "next/link";
import EventCard from "@/components/cards/EventCard";
import ShopCard from "@/components/cards/ShopCard";
import TopPlayerCard from "@/components/cards/TopPlayerCard";
import HeroOps, { type OpsLadderRow, type OpsTournament } from "@/components/home/HeroOps";
import { getTournaments, getLeaderboardPreview, getHomeStats } from "@/lib/api";
import { events, shopItems, players, tickerItems } from "@/lib/data";

export const revalidate = 60;

// Command Deck hero data: next open tournament + solo ladder top 3.
// Both endpoints are public; failures degrade to a hero without the panel.
async function getHeroData() {
  const [tRes, lbRes, hsRes] = await Promise.allSettled([
    getTournaments({ limit: 20 }),
    getLeaderboardPreview(),
    getHomeStats(),
  ]);
  const tournaments = tRes.status === "fulfilled" ? tRes.value.tournaments : [];
  const homeStats = hsRes.status === "fulfilled" ? hsRes.value : null;
  const open = tournaments
    .filter((t) => t.status === "Registration" && t.starts_at)
    .sort((a, b) => new Date(a.starts_at!).getTime() - new Date(b.starts_at!).getTime());
  const next: OpsTournament | null = open[0]
    ? {
        id: open[0].id,
        name: open[0].name,
        mode: open[0].mode,
        max_slots: open[0].max_slots,
        filled_slots: open[0].filled_slots,
        entry_fee_bdt: open[0].entry_fee_bdt,
        prize_pool_bdt: open[0].prize_pool_bdt,
        status: open[0].status,
        starts_at: open[0].starts_at,
      }
    : null;
  const ladder: OpsLadderRow[] =
    lbRes.status === "fulfilled" ? lbRes.value.solo_identity_top5.slice(0, 3) : [];
  const prizeTotal = tournaments.reduce((s, t) => s + (t.prize_pool_bdt || 0), 0);
  return { next, ladder, eventCount: tournaments.length, prizeTotal, homeStats };
}

export default async function HomePage() {
  const hero = await getHeroData();
  const upcoming = events.filter((e) => e.type !== "live");
  const liveItems = events.filter((e) => e.type === "live");
  const homeShop = shopItems.filter((i) => i.status === "active").slice(0, 4);
  const topPlayers = players.slice(0, 12);
  // duplicate ticker list for seamless marquee loop
  const ticker = [...tickerItems, ...tickerItems];
  const prizeLabel =
    hero.prizeTotal >= 100000
      ? `৳${(hero.prizeTotal / 100000).toFixed(1).replace(/\.0$/, "")}L`
      : `৳${hero.prizeTotal.toLocaleString()}`;

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
              <div><b>{hero.eventCount || 6}</b><span>Season Events</span></div>
              <div><b>{prizeLabel}</b><span>Prize Pool</span></div>
              <div><b>2K+</b><span>Players</span></div>
              <div className="reg"><b>● OPEN</b><span>Registration</span></div>
            </div>
          </div>

          <HeroOps tournament={hero.next} ladder={hero.ladder} />
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
            <div className="qstat-n">{hero.homeStats?.total_players ?? "2K+"}</div>
            <div className="qstat-l">Registered Players</div>
          </div>
          <div className="qstat-item">
            <div className="qstat-n">{hero.eventCount || 6}</div>
            <div className="qstat-l">Season Events</div>
          </div>
          <div className="qstat-item">
            <div className="qstat-n">{prizeLabel}</div>
            <div className="qstat-l">Total Prize Pool</div>
          </div>
          <div className="qstat-item">
            <div className="qstat-n">{hero.homeStats?.total_countries || 1}</div>
            <div className="qstat-l">Countries</div>
          </div>
        </div>

        {/* LIVE EVENTS */}
        {liveItems.length > 0 && (
          <div className="live-events-section rv">
            <div className="live-section-header">
              <div className="live-pulse-icon" />
              <div className="live-section-title">LIVE NOW</div>
            </div>
            <div className="ev3d-grid">
              {liveItems.map((ev) => (
                <EventCard key={ev.id} ev={ev} href="/" />
              ))}
            </div>
          </div>
        )}

        {/* GAMING EVENTS */}
        <div className="feat-events rv">
          <div className="section-strip">
            <div className="section-strip-line" />
            <span className="section-strip-icon">🏆</span>
            <div className="section-strip-title">UPCOMING EVENTS 2026</div>
            <span className="section-strip-icon">⚽</span>
            <div className="section-strip-line r" />
          </div>
          <div className="ev3d-grid">
            {upcoming.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
            <Link className="btn btn-gh" href="/tournaments" style={{ fontSize: ".6rem" }}>
              🏆 View All Tournaments &amp; Brackets →
            </Link>
          </div>
        </div>

        <div className="gold-divider" />

        {/* TOP PLAYERS */}
        <div className="ntp-section rv" style={{ margin: "2.5rem 0" }}>
          <div className="section-strip">
            <div className="section-strip-line" />
            <span className="section-strip-icon">👑</span>
            <div className="section-strip-title">TOP PLAYERS</div>
            <span className="section-strip-icon">⚔️</span>
            <div className="section-strip-line r" />
          </div>
          <div className="ntp-grid">
            {topPlayers.map((p, i) => (
              <TopPlayerCard key={p.id} p={p} i={i} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
            <Link className="btn btn-gh" href="/rankings" style={{ fontSize: ".6rem" }}>
              📊 View Full Rankings →
            </Link>
          </div>
        </div>

        <div className="gold-divider" />

        {/* REGISTER CTA BAND */}
        <div className="cta-band rv">
          <div className="cta-band-text">
            <h3>⚽ READY TO COMPETE IN 2026?</h3>
            <p>
              Join thousands of players in Bangladesh&apos;s biggest eFootball
              season. ৳600 entry fee. All skill levels welcome.
            </p>
          </div>
          <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap" }}>
            <Link className="btn btn-lm" href="/register">
              Register Now →
            </Link>
            <Link className="btn btn-gh" href="/rankings">
              📊 View Rankings
            </Link>
          </div>
        </div>

        {/* STORE ITEMS */}
        <div className="shop-preview rv">
          <div className="section-strip">
            <div className="section-strip-line" />
            <span className="section-strip-icon">🛒</span>
            <div className="section-strip-title">OFFICIAL STORE</div>
            <span className="section-strip-icon">👕</span>
            <div className="section-strip-line r" />
          </div>
          <div
            className="sp-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.3rem" }}
          >
            {homeShop.map((item) => (
              <ShopCard key={item.id} item={item} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
            <Link className="btn btn-lm" href="/shop">
              🛒 Browse Full Shop →
            </Link>
          </div>
        </div>

        <div className="gold-divider" />

        {/* BOTTOM INFO CARDS */}
        <div className="g3 rv" style={{ marginTop: "2.5rem" }}>
          <Link className="glass" href="/rankings" style={{ padding: "1.7rem", display: "block" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: ".8rem", filter: "drop-shadow(0 0 10px rgba(255,184,0,.5))" }}>📊</div>
            <div style={{ fontFamily: "var(--fh)", fontSize: "1.25rem", letterSpacing: ".06em", marginBottom: ".4rem", background: "linear-gradient(135deg,var(--white),rgba(255,248,231,.8))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              RANKINGS 2026
            </div>
            <div style={{ fontSize: ".78rem", color: "var(--gray)", lineHeight: 1.6 }}>
              National leaderboard — updated weekly
            </div>
            <div style={{ marginTop: "1rem", fontFamily: "var(--fo)", fontSize: ".56rem", color: "var(--gold)", letterSpacing: ".13em", textTransform: "uppercase" }}>
              View Leaderboard →
            </div>
          </Link>

          <Link className="glass" href="/news" style={{ padding: "1.7rem", display: "block" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: ".8rem", filter: "drop-shadow(0 0 10px rgba(57,211,83,.5))" }}>📰</div>
            <div style={{ fontFamily: "var(--fh)", fontSize: "1.25rem", letterSpacing: ".06em", marginBottom: ".4rem", background: "linear-gradient(135deg,var(--white),rgba(255,248,231,.8))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              NEWS 2026
            </div>
            <div style={{ fontSize: ".78rem", color: "var(--gray)", lineHeight: 1.6 }}>
              Tournament news, player updates &amp; announcements
            </div>
            <div style={{ marginTop: "1rem", fontFamily: "var(--fo)", fontSize: ".56rem", color: "var(--gold)", letterSpacing: ".13em", textTransform: "uppercase" }}>
              Read News →
            </div>
          </Link>

          <Link className="glass" href="/sponsorship" style={{ padding: "1.7rem", display: "block" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: ".8rem", filter: "drop-shadow(0 0 10px rgba(255,184,0,.5))" }}>🤝</div>
            <div style={{ fontFamily: "var(--fh)", fontSize: "1.25rem", letterSpacing: ".06em", marginBottom: ".4rem", background: "linear-gradient(135deg,var(--white),rgba(255,248,231,.8))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              SPONSORSHIP
            </div>
            <div style={{ fontSize: ".78rem", color: "var(--gray)", lineHeight: 1.6 }}>
              Partner with Bangladesh&apos;s #1 eFootball platform
            </div>
            <div style={{ marginTop: "1rem", fontFamily: "var(--fo)", fontSize: ".56rem", color: "var(--gold)", letterSpacing: ".13em", textTransform: "uppercase" }}>
              View Packages →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
