"use client";

// Phase 2 — Leaderboards (FR-049…052, REQ-42).
// Dual-tab split (Solo Identity / Club Match) + device boards + all-time.
// Photo on every row (FR-049), crowns top 3 (FR-050), my-row gold (FR-052),
// season banner (REQ-42) with graceful no-active-season state.

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getLeaderboard,
  getActiveSeason,
  type LeaderboardKind,
  type LeaderboardRow,
  type Season,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import IdentityChip from "@/components/system/IdentityChip";
import { Skeleton, EmptyState } from "@/components/system/Realtime";
import CoinIcon from "@/components/system/CoinIcon";

const BOARDS: { key: LeaderboardKind; label: string; blurb: string }[] = [
  { key: "solo-identity", label: "Solo Identity", blurb: "Global 1v1 ladder" },
  { key: "club-match", label: "Club Match", blurb: "National club ladder" },
  { key: "mobile", label: "Mobile", blurb: "Mobile device split" },
  { key: "console", label: "Console", blurb: "Console device split" },
  { key: "all-time", label: "All-Time", blurb: "Combined absolute roster" },
];

const CROWN = { gold: "👑", silver: "🥈", bronze: "🥉" } as const;

export default function RankingsPage() {
  const { user } = useAuth();
  const [board, setBoard] = useState<LeaderboardKind>("solo-identity");
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [season, setSeason] = useState<Season | null | "loading">("loading");

  useEffect(() => {
    getActiveSeason().then(setSeason);
  }, []);

  useEffect(() => {
    setRows(null);
    let dead = false;
    getLeaderboard(board)
      .then((d) => {
        if (!dead) {
          setRows(d.rankings);
          setTotal(d.total_players);
        }
      })
      .catch(() => !dead && setRows([]));
    return () => {
      dead = true;
    };
  }, [board]);

  const active = BOARDS.find((b) => b.key === board)!;

  return (
    <div
      className="page act"
      style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 className="ht" style={{ fontSize: "2.2rem", marginBottom: ".4rem" }}>
          <span className="go">RANKINGS</span>
        </h1>

        {/* Season banner (REQ-42) */}
        {season !== "loading" && (
          <div className={`eb-season${season ? " live" : ""}`}>
            {season ? (
              <>
                <span className="eb-livedot" aria-hidden />
                <b>{String(season.name ?? "Season")} live</b>
                {season.ends_at ? (
                  <span>
                    — resets{" "}
                    {new Date(String(season.ends_at)).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                ) : null}
                <span className="rw">
                  Top 20 earn <CoinIcon type="s" size={13} /> S Coins
                </span>
              </>
            ) : (
              <span>⏳ Off-season — the next 90-day ladder starts soon. All-time boards stay live.</span>
            )}
          </div>
        )}

        {/* Board tabs */}
        <div className="eb-pf-tabs" role="tablist" style={{ margin: "1.1rem 0" }}>
          {BOARDS.map((b) => (
            <button key={b.key} role="tab" aria-selected={board === b.key}
              className={`eb-pf-tab${board === b.key ? " on" : ""}`}
              onClick={() => setBoard(b.key)}>
              {b.label}
            </button>
          ))}
        </div>
        <p className="hd" style={{ fontSize: ".78rem", marginBottom: ".9rem" }}>
          {active.blurb} · {total} ranked player{total === 1 ? "" : "s"}
        </p>

        {/* Board */}
        {rows === null ? (
          <div style={{ display: "grid", gap: ".5rem" }}>
            {[...Array(6)].map((_, i) => <Skeleton key={i} style={{ width: "100%", height: 52 }} />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="Ladder is empty"
            desc="Ranked matches place players here. Be the first — queue up and claim rank #1."
            action={user ? (
              <Link className="btn btn-lm btn-sm" href="/profile">⚡ Find Match</Link>
            ) : (
              <Link className="btn btn-lm btn-sm" href="/login?next=/rankings">Claim your rank</Link>
            )}
          />
        ) : (
          <ol className="eb-lb">
            {rows.map((r) => {
              const mine = user?.id === r.player_id;
              const crown = (r.crown?.toLowerCase() ?? null) as keyof typeof CROWN | null;
              return (
                <li key={r.player_id} className={`eb-lb-row${mine ? " me" : ""}${crown ? ` ${crown}` : ""}`}>
                  <span className="eb-lb-rank">
                    {crown ? <span className="cr">{CROWN[crown]}</span> : `#${r.rank}`}
                  </span>
                  <Link href={`/players/${r.player_id}`} className="eb-lb-id">
                    <IdentityChip
                      name={r.username}
                      avatarUrl={r.profile_photo_url}
                      clubName={r.club_name}
                      size="md"
                      elite={crown === "gold"}
                    />
                  </Link>
                  {mine ? <span className="eb-lb-you">YOU</span> : null}
                  <span className="eb-lb-pts">{r.rank_points.toLocaleString()} pts</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
