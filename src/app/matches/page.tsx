"use client";

// Phase 2 — Match Centre (FR-004, FR-044…048): global index of matches in
// Upcoming / Ongoing / Completed states, with the universal filter bar
// (REQ-54) and point transparency (REQ-46) on completed cards.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getMatches, type ApiMatch } from "@/lib/api";
import MatchCard from "@/components/system/MatchCard";
import FilterBar, { useFilters } from "@/components/system/FilterBar";
import { Skeleton, EmptyState } from "@/components/system/Realtime";

const STAGES = ["Upcoming", "Ongoing", "Completed"] as const;
type Stage = (typeof STAGES)[number];

function stageOf(m: ApiMatch): Stage {
  if (m.completed_at || ["completed", "verified", "finished"].includes(m.status?.toLowerCase?.() ?? "")) return "Completed";
  if (m.started_at || ["ongoing", "live", "in_progress"].includes(m.status?.toLowerCase?.() ?? "")) return "Ongoing";
  return "Upcoming";
}

function sideNames(m: ApiMatch): { home: string; away: string } {
  return {
    home: m.club_a_name ?? m.player_a_username ?? "TBD",
    away: m.club_b_name ?? m.player_b_username ?? "TBD",
  };
}

export default function MatchCentrePage() {
  const [matches, setMatches] = useState<ApiMatch[] | null>(null);
  const [stage, setStage] = useState<Stage>("Upcoming");
  const [filters, setFilters] = useFilters("matches");

  useEffect(() => {
    getMatches().then(setMatches).catch(() => setMatches([]));
  }, []);

  const shown = useMemo(() => {
    if (!matches) return null;
    let list = matches.filter((m) => stageOf(m) === stage);
    if (filters.matchType) {
      list = list.filter((m) => (m.type ?? "").toLowerCase().includes(filters.matchType));
    }
    return list;
  }, [matches, stage, filters]);

  const counts = useMemo(() => {
    const c: Record<Stage, number> = { Upcoming: 0, Ongoing: 0, Completed: 0 };
    matches?.forEach((m) => c[stageOf(m)]++);
    return c;
  }, [matches]);

  return (
    <div
      className="page act"
      style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 className="ht" style={{ fontSize: "2.2rem", marginBottom: ".8rem" }}>
          <span className="ac">MATCH</span> <span className="go">CENTRE</span>
        </h1>

        <div style={{ marginBottom: "1rem" }}>
          <FilterBar value={filters} onChange={setFilters} hide={["rank"]} />
        </div>

        <div className="eb-pf-tabs" role="tablist" style={{ marginBottom: "1.1rem" }}>
          {STAGES.map((s) => (
            <button key={s} role="tab" aria-selected={stage === s}
              className={`eb-pf-tab${stage === s ? " on" : ""}`} onClick={() => setStage(s)}>
              {s} {matches ? `(${counts[s]})` : ""}
            </button>
          ))}
        </div>

        {shown === null ? (
          <div className="eb-sys-grid">
            {[...Array(3)].map((_, i) => <Skeleton key={i} style={{ width: "100%", height: 120 }} />)}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={stage === "Ongoing" ? "📡" : stage === "Completed" ? "🏁" : "📅"}
            title={`No ${stage.toLowerCase()} matches`}
            desc={
              stage === "Upcoming"
                ? "Scheduled club matches and solo battles will appear here."
                : stage === "Ongoing"
                  ? "Nothing live right now. Check the Live tab for streams when matches kick off."
                  : "Finished matches land here with verified scores and point math."
            }
          />
        ) : (
          <div className="eb-sys-grid">
            {shown.map((m) => {
              const { home, away } = sideNames(m);
              const st = stageOf(m);
              const when = m.scheduled_at ?? m.created_at;
              const pts =
                st === "Completed" && (m.points_awarded_a != null || m.points_awarded_b != null)
                  ? `+${Math.max(m.points_awarded_a ?? 0, m.points_awarded_b ?? 0)} pts${m.coin_challenge ? " · coin challenge" : ""}`
                  : m.coin_challenge
                    ? `coin challenge (${m.coin_cost ?? "?"} BC)`
                    : undefined;
              return (
                <Link key={m.id} href={`/matches/${m.id}`} style={{ display: "block" }}>
                  <MatchCard
                    status={st === "Completed" ? "completed" : st === "Ongoing" ? "live" : "upcoming"}
                    home={{ name: home }}
                    away={{ name: away }}
                    context={`${m.type ?? "Match"}${m.referee_mode ? ` · ${m.referee_mode}` : ""}`}
                    timeLabel={when ? new Date(when).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : undefined}
                    pointsLabel={pts}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
