"use client";

// Phase 6 — Shorts feed (FR-053…056): full-screen vertical viewport with
// CSS scroll-snap. Z-isolated under the navbar (FR-056). Videos load lazily;
// metadata overlay per FR-054.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getShorts, type MediaShort } from "@/lib/api";
import { EmptyState, Skeleton } from "@/components/system/Realtime";

export default function ShortsPage() {
  const [shorts, setShorts] = useState<MediaShort[] | null>(null);

  useEffect(() => {
    getShorts().then((d) => setShorts(d.shorts)).catch(() => setShorts([]));
  }, []);

  return (
    <div className="page act" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
      {shorts === null ? (
        <div style={{ padding: "2rem 1.25rem" }}>
          <Skeleton style={{ width: "100%", height: 300 }} />
        </div>
      ) : shorts.length === 0 ? (
        <div style={{ padding: "2rem 1.25rem 5rem", maxWidth: 700, margin: "0 auto" }}>
          <h1 className="ht" style={{ fontSize: "2.2rem", marginBottom: "1.2rem" }}>
            <span className="ac">SHORTS</span>
          </h1>
          <EmptyState
            icon="🎬"
            title="No clips yet"
            desc="Goal highlights, upset wins, and community edits will scroll here — full-screen, swipe after swipe."
            action={<Link className="btn btn-lm btn-sm" href="/live">▶ Watch live instead</Link>}
          />
        </div>
      ) : (
        <div className="eb-shorts" role="feed" aria-label="Shorts feed">
          {shorts.map((s) => (
            <section className="eb-short" key={s.id}>
              <video
                src={s.video_url}
                poster={s.thumbnail_url ?? undefined}
                controls
                playsInline
                preload="metadata"
              />
              <div className="eb-short-meta">
                <b>{s.title}</b>
                {s.creator_username ? <span>@{s.creator_username}</span> : null}
                <span>{s.view_count.toLocaleString()} views</span>
                {s.tags?.length ? <span className="tags">{s.tags.map((t) => `#${t}`).join(" ")}</span> : null}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
