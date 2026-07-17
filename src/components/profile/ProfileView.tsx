"use client";

// Phase 1 — full player profile (FR-024…043).
// Renders any player by id; `own` adds Edit/Logout/Dossier + Following Feed.
// Data: /players/{id}/ (nested public shape) + career/form/ratings/analytics
// sub-endpoints, all fetched in parallel. Every section has an empty state —
// a brand-new player must still look intentional.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  getPlayer,
  getPlayerCareer,
  getPlayerForm,
  getPlayerRatings,
  getPlayerAnalytics,
  getFeed,
  followPlayer,
  unfollowPlayer,
  exportDossier,
  type PublicPlayer,
  type CareerData,
  type FormData,
  type RatingEntry,
  type AnalyticsData,
  type FeedItem,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/system/StatusBadge";
import { Skeleton, EmptyState, CountUp } from "@/components/system/Realtime";
import { FormGrid, RatingsBars, RadarChart, StatTile } from "./charts";
import MatchmakingWidget from "@/components/system/MatchmakingWidget";
import InvitationsCard from "./InvitationsCard";

const TABS = ["Overview", "News", "Timeline", "Statistics", "Matches"] as const;
type Tab = (typeof TABS)[number];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function ProfileView({ playerId, own = false }: { playerId: string; own?: boolean }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const toast = useToast();

  const [player, setPlayer] = useState<PublicPlayer | null>(null);
  const [career, setCareer] = useState<CareerData | null>(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [ratings, setRatings] = useState<RatingEntry[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [feed, setFeed] = useState<FeedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [dossierBusy, setDossierBusy] = useState(false);

  useEffect(() => {
    let dead = false;
    Promise.all([
      getPlayer(playerId),
      getPlayerCareer(playerId).catch(() => null),
      getPlayerForm(playerId).catch(() => null),
      getPlayerRatings(playerId).catch(() => ({ ratings: [] as RatingEntry[] })),
      getPlayerAnalytics(playerId),
      own ? getFeed().catch(() => ({ feed: [] as FeedItem[], next_offset: null })) : Promise.resolve(null),
    ])
      .then(([p, c, f, r, a, fd]) => {
        if (dead) return;
        setPlayer(p);
        setCareer(c);
        setForm(f);
        setRatings(r.ratings);
        setAnalytics(a);
        if (fd) setFeed(fd.feed);
      })
      .catch((e) => {
        if (!dead) setError(e instanceof ApiError ? e.message : "Failed to load profile.");
      });
    return () => {
      dead = true;
    };
  }, [playerId, own]);

  const followerShown = useMemo(
    () => (player ? player.follower_count + (following ? 1 : 0) : 0),
    [player, following],
  );

  const toggleFollow = async () => {
    if (!user) {
      router.push(`/login?next=/players/${playerId}`);
      return;
    }
    setFollowBusy(true);
    try {
      if (following) {
        await unfollowPlayer(playerId);
        setFollowing(false);
      } else {
        await followPlayer(playerId);
        setFollowing(true);
        toast.success(`Following ${player?.username}`);
      }
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Follow failed");
    } finally {
      setFollowBusy(false);
    }
  };

  const downloadDossier = async () => {
    setDossierBusy(true);
    try {
      const data = await exportDossier(playerId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${player?.username ?? "player"}-dossier.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Data dossier downloaded");
    } catch {
      toast.error("Dossier export failed");
    } finally {
      setDossierBusy(false);
    }
  };

  if (error) {
    return (
      <EmptyState icon="🛰️" title="Profile unavailable" desc={error}
        action={<Link className="btn btn-lm btn-sm" href="/">← Home</Link>} />
    );
  }

  if (!player) {
    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <Skeleton style={{ width: "100%", height: 140 }} />
        <div style={{ display: "flex", gap: "1rem" }}>
          <Skeleton style={{ width: 96, height: 96, borderRadius: "50%" }} />
          <div style={{ display: "grid", gap: ".5rem", flex: 1 }}>
            <Skeleton style={{ width: 220, height: 26 }} />
            <Skeleton style={{ width: 320, height: 14 }} />
          </div>
        </div>
      </div>
    );
  }

  const s = player.stats_summary;
  const loc = [player.location.city, player.location.region, player.location.country]
    .filter(Boolean)
    .join(", ");
  const elite = player.elite_rank ?? false;

  return (
    <div className="eb-pf">
      {/* ── Header (FR-024/025/026) ── */}
      <div className="eb-pf-cover">
        {player.cover_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.cover_photo_url} alt="" />
        ) : null}
      </div>

      <div className="eb-pf-head">
        <div className={`eb-pf-av${elite ? " elite" : ""}`}>
          {player.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.profile_photo_url} alt={player.username} />
          ) : (
            <span>{player.username.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="eb-pf-id">
          <h1 className="eb-pf-name">
            {player.legal_name || player.username}
            {player.is_verified ? <span className="vf" title="Verified by eBattleVerse">✔</span> : null}
          </h1>
          <div className="eb-pf-handle">@{player.username}</div>
          <div className="eb-pf-meta">
            <span>{player.device_type === "console" ? "🎮 Console" : "📱 Mobile"}</span>
            {loc ? <span>📍 {loc}</span> : null}
            {player.primary_club ? (
              <span>
                🛡️ <Link href={`/clubs`}>{player.primary_club.name}</Link>
                {player.primary_club.contract_days_remaining != null ? (
                  <em className="eb-pf-contract"> · {player.primary_club.contract_days_remaining}d on contract</em>
                ) : null}
              </span>
            ) : null}
            <span>Joined {fmtDate(player.created_at)}</span>
          </div>
          <div className="eb-pf-social">
            {player.social_links.facebook ? <a href={player.social_links.facebook} target="_blank" rel="noreferrer">f</a> : null}
            {player.social_links.discord ? <a href={player.social_links.discord} target="_blank" rel="noreferrer">🎧</a> : null}
            {player.social_links.konami ? <a href={player.social_links.konami} target="_blank" rel="noreferrer">⚽</a> : null}
          </div>
        </div>

        <div className="eb-pf-actions">
          <div className="eb-pf-follows">
            <span><b><CountUp value={followerShown} /></b> followers</span>
            <span><b>{player.following_count}</b> following</span>
          </div>
          {own ? (
            <>
              <Link className="btn btn-lm btn-sm" href="/profile/edit">✏️ Edit Profile</Link>
              <button className="btn btn-gd btn-sm" onClick={downloadDossier} disabled={dossierBusy}>
                {dossierBusy ? "Exporting…" : "📦 Data Dossier"}
              </button>
              <button className="btn btn-gh btn-sm" onClick={async () => { await logout(); toast.success("Logged out"); router.push("/"); }}>
                Logout
              </button>
            </>
          ) : user?.id !== playerId ? (
            <button className={`btn btn-sm ${following ? "btn-gh" : "btn-lm"}`} onClick={toggleFollow} disabled={followBusy}>
              {following ? "✓ Following" : "+ Follow"}
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Quick metrics (FR-025) ── */}
      <div className="eb-pf-stats">
        <StatTile label="Matches" value={s.total_matches} />
        <StatTile label="Wins" value={s.total_wins} accent="lime" />
        <StatTile label="Win Rate" value={`${s.win_rate_pct.toFixed(0)}%`} accent="gold" />
        <StatTile label="Goals" value={s.total_goals} />
        <StatTile label="Solo Pts" value={player.rank_points.solo_identity} />
        <StatTile label="Club Pts" value={player.rank_points.club_match} />
      </div>

      {/* ── Tabs (FR-027) ── */}
      <div className="eb-pf-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t}
            className={`eb-pf-tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="eb-pf-grid">
          {own ? (
            <>
              <section className="eb-pf-card wide">
                <h3>Matchmaking (REQ-40)</h3>
                <MatchmakingWidget defaultPlatform={player.device_type === "mobile" ? "Mobile" : "PS5"} />
              </section>
              <section className="eb-pf-card wide">
                <h3>Club Invitations</h3>
                <InvitationsCard />
              </section>
            </>
          ) : null}
          <section className="eb-pf-card">
            <h3>Recent Form — last 50</h3>
            <FormGrid matches={form?.matches ?? []} streak={form?.current_unbeaten_streak ?? 0} />
          </section>

          <section className="eb-pf-card">
            <h3>Career Snapshot</h3>
            {career?.debut ? (
              <ul className="eb-pf-facts">
                <li><span>Debut</span><b>{fmtDate(career.debut.played_at)} vs {career.debut.opponent_username}</b></li>
                {career.last_match ? <li><span>Last match</span><b>{fmtDate(career.last_match.played_at)} vs {career.last_match.opponent_username}</b></li> : null}
                {career.avg_match_delay_days != null ? <li><span>Avg match gap</span><b>{career.avg_match_delay_days.toFixed(1)} days</b></li> : null}
                {career.max_gap_days != null ? <li><span>Longest gap</span><b>{career.max_gap_days} days</b></li> : null}
              </ul>
            ) : (
              <EmptyState icon="🎬" title="Debut pending" desc="Career history starts with the first competitive match." />
            )}
          </section>

          <section className="eb-pf-card">
            <h3>Best Moments</h3>
            {career?.best_moments ? (
              <ul className="eb-pf-facts">
                {career.best_moments.longest_unbeaten_streak ? (
                  <li><span>Longest unbeaten</span><b>{career.best_moments.longest_unbeaten_streak.count} matches</b></li>
                ) : null}
                {career.best_moments.max_goals_match ? (
                  <li><span>Goal record</span><b>{career.best_moments.max_goals_match.goals} vs {career.best_moments.max_goals_match.opponent_username} ({career.best_moments.max_goals_match.scoreline})</b></li>
                ) : null}
                {career.best_moments.most_defeated_opponent ? (
                  <li><span>Favorite victim</span><b>{career.best_moments.most_defeated_opponent.opponent_username} ×{career.best_moments.most_defeated_opponent.defeat_count}</b></li>
                ) : null}
              </ul>
            ) : (
              <EmptyState icon="🏆" title="No highlights yet" desc="Streaks, goal records, and most-defeated rivals collect here." />
            )}
          </section>

          <section className="eb-pf-card">
            <h3>Player Info (FR-043)</h3>
            <ul className="eb-pf-facts">
              <li><span>Platform</span><b>{player.device_type === "console" ? "Console" : "Mobile"}</b></li>
              <li><span>Win streak</span><b>{player.current_win_streak > 0 ? `🔥 ${player.current_win_streak}` : "—"}</b></li>
              <li><span>Role</span><b>{player.platform_role}</b></li>
              {player.is_banned ? <li><span>Status</span><StatusBadge kind="conflict" label="Suspended" /></li> : null}
            </ul>
          </section>

          {own ? (
            <section className="eb-pf-card wide">
              <h3>Following Feed</h3>
              {feed && feed.length > 0 ? (
                <ul className="eb-pf-feed">
                  {feed.map((f, i) => (
                    <li key={f.id ?? i}>
                      <b>{f.actor_username ?? "Player"}</b> {f.message ?? f.type ?? "activity"}
                      {f.created_at ? <time> · {fmtDate(f.created_at)}</time> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon="📡" title="Feed is quiet" desc="Follow players to see their results, rank changes, and streams here." />
              )}
            </section>
          ) : null}
        </div>
      )}

      {tab === "Statistics" && (
        <div className="eb-pf-grid">
          <section className="eb-pf-card">
            <h3>Tactical Radar (FR-035)</h3>
            <RadarChart
              values={analytics && !analytics.insufficient_data ? analytics.radar : null}
              positionLabel={analytics?.position_label}
            />
          </section>
          <section className="eb-pf-card">
            <h3>Match Ratings — last 10 (FR-033)</h3>
            <RatingsBars ratings={ratings} />
          </section>
        </div>
      )}

      {tab === "Matches" && (
        <section className="eb-pf-card wide">
          <h3>Match Log</h3>
          {form && form.matches.length > 0 ? (
            <table className="eb-pf-table">
              <thead><tr><th>Result</th><th>Score</th><th>Opponent</th><th>Date</th></tr></thead>
              <tbody>
                {form.matches.map((m, i) => (
                  <tr key={i}>
                    <td><StatusBadge kind={m.result === "Win" ? "win" : m.result === "Loss" ? "loss" : "draw"} /></td>
                    <td>{m.score}</td>
                    <td><Link href={`/players/${m.opponent_id}`}>{m.opponent_username}</Link></td>
                    <td>{fmtDate(m.played_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState icon="⚽" title="No matches recorded" desc="Solo battles and club matches will be listed here." />
          )}
        </section>
      )}

      {tab === "News" && (
        <EmptyState icon="📰" title="No tagged articles" desc="Platform news mentioning this player lands here." />
      )}
      {tab === "Timeline" && (
        <EmptyState icon="🗓️" title="Timeline coming online" desc="Season-by-season milestones will build up as this player competes." />
      )}
    </div>
  );
}
