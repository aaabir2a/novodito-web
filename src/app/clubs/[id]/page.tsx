"use client";

// Phase 3 — Club profile + manager dashboard (§1.4, UJ-005 manager side).
// Public: header, referees, performance, roster grid.
// Manager extras: invite-by-username, contracts table (Active/Expired/Terminated).

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getClub,
  getClubRoster,
  getClubContracts,
  lookupPlayer,
  invitePlayer,
  type ClubDetail,
  type RosterMember,
  type ClubContract,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import IdentityChip from "@/components/system/IdentityChip";
import StatusBadge from "@/components/system/StatusBadge";
import { Skeleton, EmptyState } from "@/components/system/Realtime";

function InviteBox({ clubId, onInvited }: { clubId: string; onInvited: () => void }) {
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const p = await lookupPlayer(username.trim());
      await invitePlayer(clubId, p.id);
      toast.success(`Invitation sent to ${p.username}`);
      setUsername("");
      onInvited();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="eb-club-create" onSubmit={invite}>
      <input required placeholder="Player username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <button className="btn btn-lm btn-sm" disabled={busy} type="submit">
        {busy ? "Sending…" : "📨 Invite"}
      </button>
    </form>
  );
}

export default function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [roster, setRoster] = useState<RosterMember[] | null>(null);
  const [contracts, setContracts] = useState<ClubContract[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isManager = !!user && !!club && club.manager.id === user.id;

  const load = useCallback(() => {
    getClub(id).then(setClub).catch((e) => setError(e instanceof ApiError ? e.message : "Club not found"));
    getClubRoster(id).then((d) => setRoster(d.members)).catch(() => setRoster([]));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isManager) return;
    getClubContracts(id)
      .then((d) => setContracts(Array.isArray(d) ? d : d.contracts))
      .catch(() => setContracts([]));
  }, [id, isManager]);

  if (error) {
    return (
      <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <EmptyState icon="🛡️" title="Club unavailable" desc={error}
            action={<Link className="btn btn-lm btn-sm" href="/clubs">← All clubs</Link>} />
        </div>
      </div>
    );
  }

  return (
    <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {!club ? (
          <Skeleton style={{ width: "100%", height: 150 }} />
        ) : (
          <>
            {/* Header */}
            <div className="eb-club-head">
              <span className="eb-club-emblem lg">
                {club.emblem_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={club.emblem_url} alt="" />
                ) : (
                  club.name.charAt(0).toUpperCase()
                )}
              </span>
              <div style={{ flex: 1, minWidth: 220 }}>
                <h1 className="eb-pf-name" style={{ fontSize: "1.7rem" }}>{club.name}</h1>
                <div className="eb-pf-meta" style={{ marginTop: ".35rem" }}>
                  {club.home_base ? <span>📍 {club.home_base}</span> : null}
                  <span>👥 {club.roster_count}/40{club.roster_full ? " · FULL" : ""}</span>
                  <span>🧠 Manager: <Link href={`/players/${club.manager.id}`}>{club.manager.username}</Link></span>
                </div>
                <div className="eb-pf-meta" style={{ marginTop: ".3rem" }}>
                  <span>🧑‍⚖️ Referee: {club.permanent_referee?.username ?? "unassigned"}</span>
                  <span>🧑‍⚖️ Alternate: {club.alternate_referee?.username ?? "unassigned"}</span>
                </div>
              </div>
              <div className="eb-club-pts big">{club.rank_points.toLocaleString()} pts</div>
            </div>

            {/* Performance */}
            {club.performance ? (
              <div className="eb-pf-stats" style={{ margin: "1.1rem 0" }}>
                {Object.entries(club.performance).map(([k, v]) => (
                  <div key={k} className="eb-stat-tile">
                    <span className="v">{v}</span>
                    <span className="l">{k.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="eb-pf-grid" style={{ marginTop: "1.1rem" }}>
              {/* Roster */}
              <section className="eb-pf-card wide">
                <h3>Roster</h3>
                {roster === null ? (
                  <Skeleton style={{ width: "100%", height: 60 }} />
                ) : roster.length === 0 ? (
                  <EmptyState icon="👥" title="Empty roster" desc="Members appear here once contracts are signed." />
                ) : (
                  <div className="eb-club-roster">
                    {roster.map((m) => (
                      <Link key={m.player_id} href={`/players/${m.player_id}`} className="eb-club-member">
                        <IdentityChip name={m.username} avatarUrl={m.profile_photo_url} size="sm" />
                        {m.contract_days_remaining != null ? (
                          <span className="ct">{m.contract_days_remaining}d</span>
                        ) : (
                          <span className="ct dim">no contract</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Manager tools */}
              {isManager ? (
                <>
                  <section className="eb-pf-card">
                    <h3>Recruit (manager)</h3>
                    <InviteBox clubId={club.id} onInvited={load} />
                    <p className="eb-wallet-note" style={{ marginTop: ".6rem" }}>
                      The player reviews contract terms when accepting (UJ-005). Roster cap 40.
                    </p>
                  </section>
                  <section className="eb-pf-card">
                    <h3>Contracts (manager)</h3>
                    {contracts === null ? (
                      <Skeleton style={{ width: "100%", height: 60 }} />
                    ) : contracts.length === 0 ? (
                      <EmptyState icon="📜" title="No contracts" desc="Signed contracts list here with expiry countdowns." />
                    ) : (
                      <table className="eb-pf-table">
                        <thead><tr><th>Player</th><th>Status</th><th>Days left</th></tr></thead>
                        <tbody>
                          {contracts.map((c) => (
                            <tr key={c.id}>
                              <td>{c.username}</td>
                              <td>
                                <StatusBadge
                                  kind={c.status === "Active" ? "verified" : c.status === "Expired" ? "draw" : "loss"}
                                  label={c.status}
                                />
                              </td>
                              <td>{c.days_remaining ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>
                </>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
