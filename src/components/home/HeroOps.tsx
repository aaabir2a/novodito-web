"use client";

// Hero "Live Ops" panel — the right half of the Command Deck hero.
// Real data: next open tournament (countdown + slot fill) and the solo
// ladder top 3. The hero is a working dashboard preview, not splash art.

import Link from "next/link";
import { useEffect, useState } from "react";

export interface OpsTournament {
  id: string;
  name: string;
  mode: string;
  max_slots: number;
  filled_slots: number;
  entry_fee_bdt: number;
  prize_pool_bdt: number;
  status: string;
  starts_at: string | null;
}
export interface OpsLadderRow {
  player_id: string;
  username: string;
  profile_photo_url: string | null;
  rank_points: number;
}

const CROWNS = ["👑", "🥈", "🥉"];

function useCountdown(target: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  if (!target) return null;
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

const tk = (n: number) => String(n).padStart(2, "0");
const bdt = (n: number) =>
  n >= 100000 ? `৳${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `৳${n.toLocaleString()}`;

export default function HeroOps({
  tournament,
  ladder,
}: {
  tournament: OpsTournament | null;
  ladder: OpsLadderRow[];
}) {
  const cd = useCountdown(tournament?.starts_at ?? null);
  const pct = tournament ? Math.min((tournament.filled_slots / tournament.max_slots) * 100, 100) : 0;

  return (
    <aside className="eb-ops" aria-label="Live platform status">
      <div className="eb-ops-head">
        <span className="eb-livedot" aria-hidden />
        LIVE OPS
        <span className="ln" aria-hidden />
      </div>

      {tournament ? (
        <div className="eb-ops-block">
          <div className="eb-ops-row top">
            <span className="chip">{tournament.status === "Registration" ? "REG OPEN" : tournament.status}</span>
            <span className="mode">{tournament.mode}</span>
          </div>
          <div className="eb-ops-name">{tournament.name}</div>

          {cd ? (
            <div className="eb-ops-cd" role="timer" aria-label="Time until kickoff">
              {[
                [cd.d, "D"],
                [cd.h, "H"],
                [cd.m, "M"],
                [cd.s, "S"],
              ].map(([v, l]) => (
                <span className="cell" key={l}>
                  <b>{tk(v as number)}</b>
                  <i>{l}</i>
                </span>
              ))}
            </div>
          ) : null}

          <div className="eb-ops-slots">
            <div className="bar" aria-hidden>
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="lbl">
              <span>{tournament.filled_slots}/{tournament.max_slots} slots taken</span>
              <span>{bdt(tournament.prize_pool_bdt)} prize</span>
            </div>
          </div>

          <div className="eb-ops-row">
            <span className="fee">Entry {bdt(tournament.entry_fee_bdt)}</span>
            <Link className="btn btn-lm btn-sm" href={`/tournaments/${tournament.id}`}>Secure a Slot →</Link>
          </div>
        </div>
      ) : (
        <div className="eb-ops-block">
          <div className="eb-ops-name">Season calendar loading…</div>
          <Link className="btn btn-lm btn-sm" href="/tournaments">Browse Tournaments →</Link>
        </div>
      )}

      {ladder.length > 0 ? (
        <div className="eb-ops-block">
          <div className="eb-ops-sub">SOLO LADDER — TOP {Math.min(ladder.length, 3)}</div>
          <ul className="eb-ops-ladder">
            {ladder.slice(0, 3).map((r, i) => (
              <li key={r.player_id}>
                <span className="cr" aria-hidden>{CROWNS[i]}</span>
                <span className="av" aria-hidden>
                  {r.profile_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.profile_photo_url} alt="" loading="lazy" />
                  ) : (
                    r.username.charAt(0).toUpperCase()
                  )}
                </span>
                <Link href={`/players/${r.player_id}`}>{r.username}</Link>
                <b>{r.rank_points.toLocaleString()}</b>
              </li>
            ))}
          </ul>
          <Link className="eb-ops-more" href="/rankings">Full rankings →</Link>
        </div>
      ) : null}
    </aside>
  );
}
