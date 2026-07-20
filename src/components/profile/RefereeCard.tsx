"use client";

// Referee feedback record (§1.28, §1.35, FR-128) — matches officiated,
// community star rating, pinned review. Shown on referee-role profiles.

import { useEffect, useState } from "react";
import { getRefereeProfile, type RefereeProfile } from "@/lib/api";
import { Skeleton, EmptyState } from "@/components/system/Realtime";

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return <span className="eb-ref-stars">{"★".repeat(full)}{"☆".repeat(Math.max(0, 5 - full))}</span>;
}

export default function RefereeCard({ playerId }: { playerId: string }) {
  const [data, setData] = useState<RefereeProfile | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    getRefereeProfile(playerId).then(setData).catch(() => setMissing(true));
  }, [playerId]);

  if (missing) return <EmptyState icon="🧑‍⚖️" title="No officiating record yet" />;
  if (!data) return <Skeleton style={{ width: "100%", height: 70 }} />;

  return (
    <div>
      <div className="eb-ref-stats">
        <div className="eb-stat-tile" style={{ minWidth: 100 }}>
          <span className="v">{data.matches_officiated}</span>
          <span className="l">Matches Officiated</span>
        </div>
        <div className="eb-stat-tile gold" style={{ minWidth: 100 }}>
          <span className="v">{data.avg_star_rating != null ? data.avg_star_rating.toFixed(1) : "—"}</span>
          <span className="l">Avg Rating</span>
        </div>
      </div>
      {data.avg_star_rating != null ? (
        <div style={{ marginTop: ".6rem" }}><Stars value={data.avg_star_rating} /></div>
      ) : null}
      {data.pinned_review ? (
        <div className="eb-ref-review">
          &ldquo;{data.pinned_review.comment}&rdquo;
          <span className="by">— {data.pinned_review.rated_by} · {data.pinned_review.stars}★</span>
        </div>
      ) : null}
    </div>
  );
}
