"use client";

// Single tournament page: header (status, mode, dates, prize, entry), slot
// fill, registered clubs, and the Register flow (UJ-002).

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, getTournament, type TournamentDetail } from "@/lib/api";
import StatusBadge from "@/components/system/StatusBadge";
import { Skeleton, EmptyState } from "@/components/system/Realtime";
import RegisterModal from "@/components/tournaments/RegisterModal";

const bdt = (n: number) => (n >= 100000 ? `৳${(n / 100000).toFixed(1).replace(/\.0$/, "")}L` : `৳${n.toLocaleString()}`);
const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "TBD";

function StatusKind(s: string): "live" | "verified" | "pending" | "neutral" {
  if (s === "Ongoing") return "live";
  if (s === "Completed") return "verified";
  if (s === "Registration") return "pending";
  return "neutral";
}

export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [t, setT] = useState<TournamentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReg, setShowReg] = useState(false);

  const load = useCallback(() => {
    getTournament(id).then(setT).catch((e) => setError(e instanceof ApiError ? e.message : "Tournament not found"));
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <EmptyState icon="🏆" title="Tournament unavailable" desc={error}
            action={<Link className="btn btn-lm btn-sm" href="/tournaments">← All tournaments</Link>} />
        </div>
      </div>
    );
  }

  const pct = t && t.max_slots ? Math.min((t.filled_slots / t.max_slots) * 100, 100) : 0;
  const canRegister = t?.status === "Registration" && !t?.slots_full;

  return (
    <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Link className="eb-ops-more" href="/tournaments" style={{ marginBottom: ".8rem" }}>← All tournaments</Link>

        {!t ? (
          <Skeleton style={{ width: "100%", height: 180 }} />
        ) : (
          <>
            {/* Header */}
            <div className="eb-tdetail-head">
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".6rem", flexWrap: "wrap", marginBottom: ".5rem" }}>
                  <StatusBadge kind={StatusKind(t.status)} label={t.status === "Registration" ? "Registration Open" : t.status} />
                  <span className="eb-status neutral">{t.mode}</span>
                  <span className="eb-status neutral">{t.bracket_type}</span>
                </div>
                <h1 className="eb-hero-h1" style={{ fontSize: "clamp(1.9rem,5vw,2.8rem)", marginBottom: ".5rem" }}>{t.name}</h1>
                <div className="eb-pf-meta">
                  <span>📅 {fmt(t.starts_at)}{t.ends_at ? ` → ${fmt(t.ends_at)}` : ""}</span>
                </div>
              </div>
              <div className="eb-tdetail-prize">
                <span className="lbl">Prize Pool</span>
                <b>{bdt(t.prize_pool_bdt)}</b>
              </div>
            </div>

            {/* Stat tiles */}
            <div className="eb-pf-stats" style={{ margin: "1.2rem 0" }}>
              <div className="eb-stat-tile gold"><span className="v">{bdt(t.entry_fee_bdt)}</span><span className="l">Entry Fee</span></div>
              <div className="eb-stat-tile"><span className="v">{t.max_slots}</span><span className="l">Max Slots</span></div>
              <div className="eb-stat-tile lime"><span className="v">{t.slots_remaining}</span><span className="l">Slots Left</span></div>
              <div className="eb-stat-tile"><span className="v">{t.approved_count}</span><span className="l">Confirmed Teams</span></div>
            </div>

            {/* Slot fill + register */}
            <div className="eb-pf-card" style={{ marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem", fontFamily: "var(--fo)", fontSize: ".62rem", letterSpacing: ".08em", color: "rgba(185,200,190,.75)", textTransform: "uppercase" }}>
                <span>{t.filled_slots}/{t.max_slots} slots filled</span>
                <span>{pct.toFixed(0)}%</span>
              </div>
              <div className="eb-ops-slots"><div className="bar" aria-hidden><span style={{ width: `${pct}%` }} /></div></div>
              <div style={{ marginTop: "1rem", display: "flex", gap: ".7rem", flexWrap: "wrap", alignItems: "center" }}>
                {canRegister ? (
                  <button className="btn btn-lm" onClick={() => setShowReg(true)}>🏆 Register Your Club</button>
                ) : (
                  <button className="btn btn-gh" disabled>{t.slots_full ? "Slots Full" : "Registration Closed"}</button>
                )}
                <span className="eb-reg-hint" style={{ margin: 0 }}>Managers register teams with a bKash TxnID.</span>
              </div>
            </div>

            {/* Registered clubs */}
            <div className="eb-pf-card">
              <h3>Confirmed Teams ({t.approved_count})</h3>
              {t.approved_clubs.length === 0 ? (
                <EmptyState icon="🛡️" title="No confirmed teams yet" desc="Approved clubs appear here as registrations clear payment review." />
              ) : (
                <div className="eb-tdetail-teams">
                  {t.approved_clubs.map((c) => (
                    <Link key={c.id} href={`/clubs/${c.id}`} className="eb-club-member">
                      <span style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                        <span className="eb-club-emblem sm">{c.emblem_url ? null : c.name.charAt(0).toUpperCase()}</span>
                        {c.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {t && showReg ? (
        <RegisterModal tournament={t} onClose={() => setShowReg(false)} onDone={load} />
      ) : null}
    </div>
  );
}
