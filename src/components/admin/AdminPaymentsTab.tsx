"use client";

// Payment ledger (UJ-006): bKash entries by status, approve/reject with reason.
// Approving allocates the tournament slot + triggers WhatsApp confirmation
// (backend), so the confirm copy sets that expectation.

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  approvePayment,
  getAdminPayments,
  rejectPayment,
  type PaymentEntry,
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/system/StatusBadge";
import { EmptyState, Skeleton } from "@/components/system/Realtime";

const FILTERS = ["Pending", "Approved", "Rejected", "All"] as const;
type Filter = (typeof FILTERS)[number];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function AdminPaymentsTab() {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("Pending");
  const [rows, setRows] = useState<PaymentEntry[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<PaymentEntry | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(() => {
    setRows(null);
    getAdminPayments(filter === "All" ? undefined : filter)
      .then(setRows)
      .catch(() => setRows([]));
  }, [filter]);
  useEffect(() => {
    load();
  }, [load]);

  const approve = async (e: PaymentEntry) => {
    setBusyId(e.id);
    try {
      await approvePayment(e.id);
      toast.success(`Approved — slot allocated to ${e.club_name}. WhatsApp confirmation queued.`);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Approve failed");
    } finally {
      setBusyId(null);
    }
  };

  const doReject = async () => {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      await rejectPayment(rejecting.id, reason.trim());
      toast.success(`Rejected ${rejecting.club_name}'s entry`);
      setRejecting(null);
      setReason("");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Reject failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="eb-pf-tabs" style={{ marginBottom: "1rem" }}>
        {FILTERS.map((f) => (
          <button key={f} className={`eb-pf-tab${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {rows === null ? (
        <Skeleton style={{ width: "100%", height: 120 }} />
      ) : rows.length === 0 ? (
        <EmptyState icon="💳" title={`No ${filter.toLowerCase()} entries`} desc="bKash registration entries land here for review." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="eb-pf-table">
            <thead>
              <tr><th>Club</th><th>Tournament</th><th>TxnID</th><th>Players</th><th>WhatsApp</th><th>Status</th><th>When</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>{e.club_name}</td>
                  <td>{e.tournament_name}</td>
                  <td style={{ fontFamily: "var(--fo)", fontSize: ".72rem" }}>{e.txn_id}</td>
                  <td>{e.player_count}</td>
                  <td>{e.whatsapp ?? "—"}</td>
                  <td>
                    <StatusBadge
                      kind={e.payment_status === "Approved" ? "verified" : e.payment_status === "Rejected" ? "loss" : "pending"}
                      label={e.payment_status}
                    />
                  </td>
                  <td style={{ fontSize: ".72rem" }}>{fmt(e.created_at)}</td>
                  <td>
                    {e.payment_status === "Pending" ? (
                      <div style={{ display: "flex", gap: ".35rem" }}>
                        <button className="btn btn-lm btn-sm" disabled={busyId === e.id} onClick={() => approve(e)}>✓</button>
                        <button className="btn btn-rd btn-sm" disabled={busyId === e.id} onClick={() => setRejecting(e)}>✕</button>
                      </div>
                    ) : e.payment_status === "Rejected" && e.reject_reason ? (
                      <span style={{ fontSize: ".7rem", color: "rgba(255,120,120,.8)" }}>{e.reject_reason}</span>
                    ) : e.approved_by_username ? (
                      <span style={{ fontSize: ".7rem", color: "rgba(170,190,180,.6)" }}>by {e.approved_by_username}</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejecting ? (
        <>
          <div className="eb-sheet-scrim" style={{ zIndex: 750 }} onClick={() => setRejecting(null)} />
          <div className="eb-contract-modal" role="dialog" aria-label="Reject entry">
            <h3>✕ Reject Entry</h3>
            <p className="cl">Club</p>
            <p className="cv">{rejecting.club_name} · {rejecting.txn_id}</p>
            <p className="cl">Reason (optional)</p>
            <textarea
              className="eb-admin-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. TxnID not found in bKash ledger"
              rows={3}
            />
            <div style={{ display: "flex", gap: ".6rem", marginTop: "1rem" }}>
              <button className="btn btn-rd btn-sm" disabled={busyId === rejecting.id} onClick={doReject}>Confirm Reject</button>
              <button className="btn btn-gh btn-sm" onClick={() => setRejecting(null)}>Cancel</button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
