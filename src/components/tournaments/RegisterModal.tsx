"use client";

// Tournament registration (UJ-002, FR-057…063): a club manager submits a
// bKash TxnID + contact info. Handles the whole decision tree up front so the
// user never hits a wall: guest → login, no-club → found a club, non-manager
// → explain, manager → the form. On success shows the Pending → Approved
// expectation (WhatsApp confirmation in 2–4h).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ApiError,
  getClubs,
  registerForTournament,
  type ClubListItem,
  type TournamentDetail,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";

type Gate = "loading" | "guest" | "no-club" | "manager";

export default function RegisterModal({
  tournament,
  onClose,
  onDone,
}: {
  tournament: TournamentDetail;
  onClose: () => void;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [gate, setGate] = useState<Gate>("loading");
  const [club, setClub] = useState<ClubListItem | null>(null);
  const [txn, setTxn] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [handle, setHandle] = useState("");
  const [players, setPlayers] = useState(8);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Resolve which club (if any) this user manages.
  useEffect(() => {
    if (!user) {
      setGate("guest");
      return;
    }
    getClubs()
      .then((d) => {
        const mine = d.clubs.find((c) => c.manager_username === user.username);
        if (mine) {
          setClub(mine);
          setHandle(user.username);
          setGate("manager");
        } else {
          setGate("no-club");
        }
      })
      .catch(() => setGate("no-club"));
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;
    setBusy(true);
    try {
      await registerForTournament(tournament.id, {
        txn_id: txn.trim(),
        whatsapp: whatsapp.trim() || undefined,
        manager_handle: handle.trim() || undefined,
        player_count: players,
      });
      setDone(true);
      toast.success("Registration submitted — pending review");
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const feeLabel = `৳${tournament.entry_fee_bdt.toLocaleString()}`;

  return (
    <>
      <div className="eb-sheet-scrim" style={{ zIndex: 750 }} onClick={onClose} />
      <div className="eb-contract-modal" role="dialog" aria-label="Tournament registration" style={{ width: "min(480px,94vw)" }}>
        <h3>🏆 Register — {tournament.name}</h3>

        {done ? (
          <div>
            <div className="eb-status pending" style={{ marginBottom: ".8rem" }}>⏳ Pending Review</div>
            <p style={{ fontSize: ".86rem", color: "rgba(205,220,210,.85)", lineHeight: 1.6 }}>
              Your entry is in the admin queue. Once your bKash payment is verified,
              your slot is locked and a WhatsApp confirmation goes out within 2–4 hours.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <button className="btn btn-lm btn-sm" onClick={onClose}>Done</button>
            </div>
          </div>
        ) : gate === "loading" ? (
          <p className="hd">Checking your club status…</p>
        ) : gate === "guest" ? (
          <div>
            <p style={{ fontSize: ".86rem", color: "rgba(205,220,210,.85)", lineHeight: 1.6 }}>
              Sign in as a club manager to register a team for this tournament.
            </p>
            <div style={{ display: "flex", gap: ".6rem", marginTop: "1rem" }}>
              <button className="btn btn-lm btn-sm" onClick={() => router.push(`/login?next=/tournaments/${tournament.id}`)}>Sign In</button>
              <button className="btn btn-gh btn-sm" onClick={onClose}>Cancel</button>
            </div>
          </div>
        ) : gate === "no-club" ? (
          <div>
            <p style={{ fontSize: ".86rem", color: "rgba(205,220,210,.85)", lineHeight: 1.6 }}>
              Tournament entries are registered by <b>club managers</b>. Found a club
              (you become its manager) and come back to register your team.
            </p>
            <div style={{ display: "flex", gap: ".6rem", marginTop: "1rem" }}>
              <Link className="btn btn-lm btn-sm" href="/clubs" onClick={onClose}>Found a Club →</Link>
              <button className="btn btn-gh btn-sm" onClick={onClose}>Cancel</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="cl">Registering as</p>
            <p className="cv">🛡️ {club?.name}</p>

            <div className="eb-reg-fee">
              <span>Entry fee</span>
              <b>{feeLabel}</b>
            </div>
            <p className="eb-reg-hint">
              Send {feeLabel} via bKash, then paste the Transaction ID below.
              Each TxnID can be used once.
            </p>

            <p className="cl">bKash Transaction ID *</p>
            <input className="eb-admin-search" style={{ marginBottom: ".7rem", maxWidth: "none" }} required
              placeholder="e.g. BKH7X2M9QP" value={txn} onChange={(e) => setTxn(e.target.value)} />

            <div className="eb-reg-row">
              <div style={{ flex: 1 }}>
                <p className="cl">WhatsApp</p>
                <input className="eb-admin-search" style={{ maxWidth: "none" }}
                  placeholder="+8801…" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
              <div style={{ width: 90 }}>
                <p className="cl">Players</p>
                <input className="eb-admin-search" style={{ maxWidth: "none" }} type="number" min={1} max={24}
                  value={players} onChange={(e) => setPlayers(Number(e.target.value))} />
              </div>
            </div>

            <p className="cl">Manager handle</p>
            <input className="eb-admin-search" style={{ marginBottom: ".9rem", maxWidth: "none" }}
              placeholder="your handle" value={handle} onChange={(e) => setHandle(e.target.value)} />

            <div style={{ display: "flex", gap: ".6rem" }}>
              <button className="btn btn-lm btn-sm" type="submit" disabled={busy || !txn.trim()}>
                {busy ? "Submitting…" : "Submit Entry"}
              </button>
              <button className="btn btn-gh btn-sm" type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
