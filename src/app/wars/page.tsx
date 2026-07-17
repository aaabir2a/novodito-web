"use client";

// Phase 3 — Club Wars hub (REQ-43). Multi-day rivalries: war points table
// (Win=4 / Draw=1 / Loss=0), locked squads, winner by cumulative total.

import { useEffect, useState } from "react";
import { getWars, type ClubWar } from "@/lib/api";
import StatusBadge from "@/components/system/StatusBadge";
import { Skeleton, EmptyState } from "@/components/system/Realtime";

function fmt(iso?: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "TBD";
}

export default function WarsPage() {
  const [wars, setWars] = useState<ClubWar[] | null>(null);

  useEffect(() => {
    getWars().then((d) => setWars(d.wars)).catch(() => setWars([]));
  }, []);

  return (
    <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 className="ht" style={{ fontSize: "2.2rem", marginBottom: ".4rem" }}>
          <span className="go">CLUB WARS</span>
        </h1>
        <p className="hd" style={{ fontSize: ".8rem", marginBottom: "1.2rem" }}>
          Multi-day rivalries · 5v5 squads locked for the duration · Win 4 / Draw 1 / Loss 0 war points ·
          top scorer takes the War Master badge.
        </p>

        {wars === null ? (
          <div style={{ display: "grid", gap: ".7rem" }}>
            {[...Array(3)].map((_, i) => <Skeleton key={i} style={{ width: "100%", height: 90 }} />)}
          </div>
        ) : wars.length === 0 ? (
          <EmptyState
            icon="⚔️"
            title="No wars declared"
            desc="Admin-scheduled club rivalries appear here — 3 to 7 days, minimum 3 fixtures, cumulative war points decide it."
          />
        ) : (
          <div style={{ display: "grid", gap: ".8rem" }}>
            {wars.map((w) => {
              const live = ["active", "ongoing", "accepted"].includes((w.status ?? "").toLowerCase());
              return (
                <div key={w.id} className={`eb-war${live ? " live" : ""}`}>
                  <div className="eb-war-row">
                    <b>{w.challenger_club_name ?? "Challenger"}</b>
                    <span className="wp">{w.war_points_challenger ?? 0}</span>
                    <span className="vs">⚔️</span>
                    <span className="wp">{w.war_points_opponent ?? 0}</span>
                    <b className="r">{w.opponent_club_name ?? "Opponent"}</b>
                  </div>
                  <div className="eb-war-foot">
                    <span>{fmt(w.starts_at)} → {fmt(w.ends_at)}</span>
                    <StatusBadge
                      kind={live ? "live" : (w.status ?? "").toLowerCase() === "completed" ? "verified" : "pending"}
                      label={w.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
