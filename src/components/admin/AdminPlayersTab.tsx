"use client";

// Player moderation (§1.19, FR-155): search roster, verify toggle, ban with
// reason, suspend with duration, role assignment (master only). Ban/suspend
// are consequential → confirm modal with a required/plain reason field.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ApiError,
  assignRole,
  banPlayer,
  getAdminPlayers,
  suspendPlayer,
  verifyPlayer,
  type AdminPlayer,
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import IdentityChip from "@/components/system/IdentityChip";
import StatusBadge from "@/components/system/StatusBadge";
import { EmptyState, Skeleton } from "@/components/system/Realtime";

const ROLES = ["player", "referee", "creator", "sub_admin", "admin", "master"];

type ModalState =
  | { kind: "ban" | "suspend"; player: AdminPlayer }
  | null;

export default function AdminPlayersTab({ isMaster }: { isMaster: boolean }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AdminPlayer[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [reason, setReason] = useState("");
  const [hours, setHours] = useState(24);

  const load = useCallback(() => {
    getAdminPlayers({ q: q.trim() || undefined })
      .then((d) => setRows(d.players))
      .catch(() => setRows([]));
  }, [q]);
  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const toggleVerify = async (p: AdminPlayer) => {
    setBusyId(p.id);
    try {
      await verifyPlayer(p.id, !p.is_verified);
      toast.success(`${p.username} ${p.is_verified ? "unverified" : "verified"}`);
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    } finally {
      setBusyId(null);
    }
  };

  const changeRole = async (p: AdminPlayer, role: string) => {
    if (role === p.platform_role) return;
    setBusyId(p.id);
    try {
      await assignRole(p.id, role);
      toast.success(`${p.username} → ${role}`);
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Role change failed");
    } finally {
      setBusyId(null);
    }
  };

  const confirmModal = async () => {
    if (!modal) return;
    setBusyId(modal.player.id);
    try {
      if (modal.kind === "ban") {
        await banPlayer(modal.player.id, reason.trim());
        toast.success(`${modal.player.username} banned`);
      } else {
        await suspendPlayer(modal.player.id, hours, reason.trim());
        toast.success(`${modal.player.username} suspended ${hours}h`);
      }
      setModal(null);
      setReason("");
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <input
        className="eb-admin-search"
        placeholder="Search players by username…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {rows === null ? (
        <Skeleton style={{ width: "100%", height: 120 }} />
      ) : rows.length === 0 ? (
        <EmptyState icon="👥" title="No players" desc="Adjust your search." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="eb-pf-table">
            <thead>
              <tr><th>Player</th><th>Role</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/players/${p.id}`}>
                      <IdentityChip name={p.username} avatarUrl={p.profile_photo_url} verified={p.is_verified} size="sm" />
                    </Link>
                  </td>
                  <td>
                    {isMaster ? (
                      <select
                        className="eb-admin-role"
                        value={p.platform_role}
                        disabled={busyId === p.id}
                        onChange={(e) => changeRole(p, e.target.value)}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontFamily: "var(--fo)", fontSize: ".7rem", color: "var(--gold)" }}>{p.platform_role}</span>
                    )}
                  </td>
                  <td>
                    {p.is_banned ? <StatusBadge kind="loss" label="Banned" />
                      : p.is_suspended ? <StatusBadge kind="conflict" label="Suspended" />
                      : <StatusBadge kind="verified" label="Active" />}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap" }}>
                      <button className="btn btn-gh btn-sm" disabled={busyId === p.id} onClick={() => toggleVerify(p)}>
                        {p.is_verified ? "Unverify" : "Verify"}
                      </button>
                      <button className="btn btn-gh btn-sm" disabled={busyId === p.id} onClick={() => { setReason(""); setHours(24); setModal({ kind: "suspend", player: p }); }}>
                        Suspend
                      </button>
                      {!p.is_banned ? (
                        <button className="btn btn-rd btn-sm" disabled={busyId === p.id} onClick={() => { setReason(""); setModal({ kind: "ban", player: p }); }}>
                          Ban
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal ? (
        <>
          <div className="eb-sheet-scrim" style={{ zIndex: 750 }} onClick={() => setModal(null)} />
          <div className="eb-contract-modal" role="dialog" aria-label={modal.kind}>
            <h3>{modal.kind === "ban" ? "⛔ Ban Player" : "⏸ Suspend Player"}</h3>
            <p className="cl">Player</p>
            <p className="cv">{modal.player.username}</p>
            {modal.kind === "suspend" ? (
              <>
                <p className="cl">Duration (hours)</p>
                <div className="eb-contract-durations">
                  {[6, 24, 72, 168].map((h) => (
                    <button key={h} className={hours === h ? "on" : ""} onClick={() => setHours(h)}>{h}h</button>
                  ))}
                </div>
              </>
            ) : null}
            <p className="cl">Reason (required)</p>
            <textarea className="eb-admin-textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder={modal.kind === "ban" ? "e.g. repeated score falsification" : "e.g. toxic conduct in match chat"} />
            <div style={{ display: "flex", gap: ".6rem", marginTop: "1rem" }}>
              <button className="btn btn-rd btn-sm" disabled={!reason.trim() || busyId === modal.player.id} onClick={confirmModal}>
                Confirm {modal.kind}
              </button>
              <button className="btn btn-gh btn-sm" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
