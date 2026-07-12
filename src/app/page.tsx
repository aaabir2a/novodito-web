import Link from "next/link";
import Image from "next/image";
import EventCard from "@/components/cards/EventCard";
import ShopCard from "@/components/cards/ShopCard";
import TopPlayerCard from "@/components/cards/TopPlayerCard";
import { events, shopItems, players, tickerItems } from "@/lib/data";

export default function HomePage() {
  const upcoming = events.filter((e) => e.type !== "live");
  const liveItems = events.filter((e) => e.type === "live");
  const homeShop = shopItems.filter((i) => i.status === "active").slice(0, 4);
  const topPlayers = players.slice(0, 12);
  // duplicate ticker list for seamless marquee loop
  const ticker = [...tickerItems, ...tickerItems];

  return (
    <div className="page act" id="page-home">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="h-bg" />
        <div className="h-sp">
          <div className="h-sp-c" />
          <div className="h-sp-r" />
          <div className="h-sp-r" />
          <div className="h-sp-r" />
        </div>
        <div className="h-lw">
          <div className="h-lg" />
          <Image
            className="h-li"
            id="h-lg"
            src="/logo.svg"
            alt="eBattleVerse"
            width={360}
            height={360}
            sizes="(max-width: 768px) 220px, 350px"
            priority
            unoptimized
          />
        </div>
        <div className="orb" style={{ width: 58, height: 58, top: "22%", right: "30%", animationDuration: "9s", opacity: 0.12 }} />
        <div className="orb" style={{ width: 38, height: 38, top: "65%", right: "20%", animationDuration: "7s", animationDelay: "-4s", opacity: 0.09 }} />
        <div className="orb" style={{ width: 75, height: 75, top: "38%", right: "46%", animationDuration: "12s", animationDelay: "-7s", opacity: 0.07 }} />

        <div className="hc">
          <div className="he">
            <div className="he-b" />
            <span className="he-t">Official eFootball Hub · Bangladesh · 2026</span>
          </div>
          <h1 className="ht">
            <span className="ac">PLAY.</span>
            <br />
            COMPETE.
            <br />
            <span className="go">DOMINATE.</span>
          </h1>
          <p className="hd">
            Bangladesh&apos;s premier eFootball tournament organizer. Official
            Konami partner. LAN tournaments, live streams, global rankings.
          </p>
          <div className="hbs">
            <Link className="btn btn-lm" href="/register">
              ⚽ <span>Join Tournament</span>
            </Link>
            <Link className="btn btn-gh" href="/shop">
              🛒 <span>Visit Shop</span>
            </Link>
          </div>
          <div className="ss">
            <div>
              <div className="ssv">2K+</div>
              <div className="ssl">Players</div>
            </div>
            <div>
              <div className="ssv">6</div>
              <div className="ssl">2026 Events</div>
            </div>
            <div>
              <div className="ssv">৳8M</div>
              <div className="ssl">Prize Pool</div>
            </div>
            <div>
              <div
                className="ssv"
                style={{
                  background: "linear-gradient(135deg,var(--lime),var(--lime2))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 0 9px rgba(57,211,83,.5))",
                }}
              >
                ●REG
              </div>
              <div className="ssl">Open Now</div>
            </div>
          </div>
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
            <div className="qstat-n">2K+</div>
            <div className="qstat-l">Registered Players</div>
          </div>
          <div className="qstat-item">
            <div className="qstat-n">6</div>
            <div className="qstat-l">Upcoming Events</div>
          </div>
          <div className="qstat-item">
            <div className="qstat-n">৳8M</div>
            <div className="qstat-l">Total Prize Pool</div>
          </div>
          <div className="qstat-item">
            <div className="qstat-n">50+</div>
            <div className="qstat-l">Past Tournaments</div>
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
