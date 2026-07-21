"use client";

// Tournaments listing (FR-002): status-filtered grid of real tournaments,
// each card links through to its detail + registration page.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTournaments, type ApiTournament } from "@/lib/api";
import StatusBadge from "@/components/system/StatusBadge";
import { Skeleton, EmptyState } from "@/components/system/Realtime";

const FILTERS = ["All", "Registration", "Ongoing", "Completed"] as const;
type Filter = (typeof FILTERS)[number];

const bdt = (n: number) => (n >= 100000 ? `৳${(n / 100000).toFixed(1).replace(/\.0$/, "")}L` : `৳${n.toLocaleString()}`);
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBD");

function TournamentCard({ t }: { t: ApiTournament }) {
  const pct = t.max_slots ? Math.min((t.filled_slots / t.max_slots) * 100, 100) : 0;
  const kind = t.status === "Ongoing" ? "live" : t.status === "Completed" ? "verified" : t.status === "Registration" ? "pending" : "neutral";
  return (
    <Link href={`/tournaments/${t.id}`} className="eb-tcard">
      <div className="top">
        <StatusBadge kind={kind} label={t.status === "Registration" ? "Reg Open" : t.status} />
        <span className="tags">{t.mode} · {t.bracket_type}</span>
      </div>
      <h3 className="nm">{t.name}</h3>
      <div className="dates">📅 {fmt(t.starts_at)}</div>
      <div className="bar" aria-hidden><span style={{ width: `${pct}%` }} /></div>
      <div className="ft">
        <span>{t.filled_slots}/{t.max_slots} slots</span>
        <span className="pz">{bdt(t.prize_pool_bdt)}</span>
      </div>
      <div className="foot">
        <span>Entry {bdt(t.entry_fee_bdt)}</span>
        <span className="go">View & Register →</span>
      </div>
    </Link>
  );
}

export default function TournamentsPage() {
  const [all, setAll] = useState<ApiTournament[] | null>(null);
  const [filter, setFilter] = useState<Filter>("All");

  useEffect(() => {
    getTournaments({ status: "", limit: 50 })
      .then((d) => setAll(d.tournaments))
      .catch(() => setAll([]));
  }, []);

  const shown = useMemo(() => {
    if (!all) return null;
    return filter === "All" ? all : all.filter((t) => t.status === filter);
  }, [all, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: all?.length ?? 0 };
    all?.forEach((t) => { c[t.status] = (c[t.status] ?? 0) + 1; });
    return c;
  }, [all]);

  return (
    <div className="page act" id="page-tournaments" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        <h1 className="ht" style={{ fontSize: "2.2rem", marginBottom: ".4rem" }}>
          <span className="go">TOURNAMENTS</span>
        </h1>
        <p className="hd" style={{ fontSize: ".82rem", marginBottom: "1.2rem" }}>
          Regional, national and LAN brackets. Managers register teams with a bKash TxnID; slots fill live.
        </p>

        <div className="eb-pf-tabs" role="tablist" style={{ marginBottom: "1.3rem" }}>
          {FILTERS.map((f) => (
            <button key={f} role="tab" aria-selected={filter === f}
              className={`eb-pf-tab${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
              {f} {all ? `(${counts[f] ?? 0})` : ""}
            </button>
          ))}
        </div>

        {shown === null ? (
          <div className="eb-tcard-grid">
            {[...Array(6)].map((_, i) => <Skeleton key={i} style={{ width: "100%", height: 180 }} />)}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon="🏆"
            title={`No ${filter === "All" ? "" : filter.toLowerCase() + " "}tournaments`}
            desc="New events are added each season — check back soon."
          />
        ) : (
          <div className="eb-tcard-grid">
            {shown.map((t) => <TournamentCard key={t.id} t={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
