"use client";

// Phase 3 — Match detail (UJ-003). For club matches: the 8-arena live board —
// eight 1v1 sub-match tiles, aggregate score, majority tracker. Polls every 5s
// while the match is not completed.

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ApiError, getMatch, type MatchDetail, type SubMatch } from "@/lib/api";
import StatusBadge from "@/components/system/StatusBadge";
import { Skeleton, EmptyState } from "@/components/system/Realtime";

function ArenaTile({ sm }: { sm: SubMatch }) {
  const done = sm.status?.toLowerCase?.() === "completed" || sm.winner != null;
  const aWin = sm.winner != null && sm.winner === sm.player_a;
  const bWin = sm.winner != null && sm.winner === sm.player_b;
  return (
    <div className={`eb-arena${done ? " done" : ""}`}>
      <div className="eb-arena-no">ARENA {sm.arena_number}</div>
      <div className="eb-arena-row">
        <span className={`pl${aWin ? " w" : ""}`}>{sm.player_a_username}</span>
        <span className="sc">
          {sm.score_a ?? "–"} : {sm.score_b ?? "–"}
        </span>
        <span className={`pl r${bWin ? " w" : ""}`}>{sm.player_b_username}</span>
      </div>
      <div className="eb-arena-foot">
        {sm.referee_username ? <span>🧑‍⚖️ {sm.referee_username}</span> : <span />}
        {done ? (
          <StatusBadge kind="verified" label={sm.winner_username ? `${sm.winner_username} wins` : "Done"} />
        ) : (
          <StatusBadge kind="pending" label="In play" />
        )}
      </div>
    </div>
  );
}

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let dead = false;
    const load = () =>
      getMatch(id)
        .then((m) => !dead && setMatch(m))
        .catch((e) => !dead && setError(e instanceof ApiError ? e.message : "Match not found"));
    load();
    const iv = setInterval(() => {
      if (!match?.completed_at) load();
    }, 5000);
    return () => {
      dead = true;
      clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return (
      <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <EmptyState icon="⚽" title="Match unavailable" desc={error}
            action={<Link className="btn btn-lm btn-sm" href="/matches">← Match Centre</Link>} />
        </div>
      </div>
    );
  }

  const isClub = match?.type === "ClubMatch" || (match?.club_a != null && match?.club_b != null);
  const subs = match?.sub_matches ?? [];
  const winsA = subs.filter((s) => s.winner != null && s.winner === s.player_a).length;
  const winsB = subs.filter((s) => s.winner != null && s.winner === s.player_b).length;
  const majority = Math.floor((subs.length || 8) / 2) + 1;

  return (
    <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        {!match ? (
          <Skeleton style={{ width: "100%", height: 180 }} />
        ) : (
          <>
            {/* Scoreboard header */}
            <div className="eb-board-head">
              <div className="side">
                <b>{match.club_a_name ?? match.player_a_username ?? "TBD"}</b>
                {isClub ? <span className="agg">{winsA}</span> : null}
              </div>
              <div className="mid">
                <span className="vs">VS</span>
                {match.completed_at ? (
                  <StatusBadge kind={match.is_draw ? "draw" : "verified"} label={match.is_draw ? "Draw" : "Final"} />
                ) : match.started_at ? (
                  <StatusBadge kind="live" />
                ) : (
                  <StatusBadge kind="neutral" label="Scheduled" />
                )}
              </div>
              <div className="side r">
                {isClub ? <span className="agg">{winsB}</span> : null}
                <b>{match.club_b_name ?? match.player_b_username ?? "TBD"}</b>
              </div>
            </div>
            <p className="hd" style={{ textAlign: "center", fontSize: ".75rem", margin: ".5rem 0 1.3rem" }}>
              {match.type}
              {match.coin_challenge ? ` · ⚡ coin challenge (${match.coin_cost} BC)` : ""}
              {isClub ? ` · first to ${majority} arena wins takes the match` : ""}
              {match.is_draw ? " · 4–4 split = draw" : ""}
            </p>

            {/* 8-arena board */}
            {isClub ? (
              subs.length === 0 ? (
                <EmptyState
                  icon="🏟️"
                  title="Arenas not spawned yet"
                  desc="Both managers must confirm and submit 8-player rosters. The eight 1v1 arenas appear here the moment the system spawns them."
                />
              ) : (
                <div className="eb-arena-grid">
                  {subs.map((sm) => <ArenaTile key={sm.id} sm={sm} />)}
                </div>
              )
            ) : (
              <EmptyState icon="⚔️" title="Solo battle" desc="Score screenshots + verification flow land in the solo battle room (next phase)." />
            )}

            {/* Points transparency */}
            {(match.points_awarded_a != null || match.points_awarded_b != null) && (
              <div className="eb-season" style={{ marginTop: "1.2rem" }}>
                <b>Points:</b>
                <span>{match.club_a_name ?? match.player_a_username}: +{match.points_awarded_a ?? 0}</span>
                <span>{match.club_b_name ?? match.player_b_username}: +{match.points_awarded_b ?? 0}</span>
                {match.coin_challenge ? <span className="rw">upset bonus rules applied (REQ-46)</span> : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
