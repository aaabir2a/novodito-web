"use client";

// UJ-005 player side: invitation inbox + contract review modal.
// Accepting requires explicit contract terms review — the modal states
// duration and expectations in plain language before signing.

import { useEffect, useState } from "react";
import {
  ApiError,
  getMyInvitations,
  acceptInvitation,
  type ClubInvitation,
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { EmptyState, Skeleton } from "@/components/system/Realtime";

const DURATIONS = [30, 90, 180, 365];

function ContractModal({
  inv,
  onClose,
  onSigned,
}: {
  inv: ClubInvitation;
  onClose: () => void;
  onSigned: () => void;
}) {
  const toast = useToast();
  const [duration, setDuration] = useState(90);
  const [busy, setBusy] = useState(false);

  const sign = async () => {
    setBusy(true);
    try {
      await acceptInvitation(inv.club_id, inv.id, { duration_days: duration });
      toast.success(`Contract signed — welcome to ${inv.club_name}! 🛡️`);
      onSigned();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Signing failed");
      setBusy(false);
    }
  };

  return (
    <>
      <div className="eb-sheet-scrim" style={{ zIndex: 750 }} onClick={onClose} />
      <div className="eb-contract-modal" role="dialog" aria-label="Contract review">
        <h3>📜 Contract Review</h3>
        <p className="cl">Club</p>
        <p className="cv">{inv.club_name} · {inv.club_rank_points.toLocaleString()} pts</p>
        <p className="cl">Duration</p>
        <div className="eb-contract-durations">
          {DURATIONS.map((d) => (
            <button key={d} className={duration === d ? "on" : ""} onClick={() => setDuration(d)}>
              {d} days
            </button>
          ))}
        </div>
        <p className="cl">What you agree to</p>
        <ul className="terms">
          <li>You represent {inv.club_name} in club matches and wars for the contract period.</li>
          <li>Your profile joins the club roster; the manager can field you in fixtures.</li>
          <li>The contract shows on your profile with a live countdown.</li>
        </ul>
        <div style={{ display: "flex", gap: ".6rem", marginTop: "1rem" }}>
          <button className="btn btn-lm btn-sm" disabled={busy} onClick={sign}>
            {busy ? "Signing…" : "✍️ Sign Contract"}
          </button>
          <button className="btn btn-gh btn-sm" onClick={onClose}>Not now</button>
        </div>
      </div>
    </>
  );
}

export default function InvitationsCard() {
  const [invitations, setInvitations] = useState<ClubInvitation[] | null>(null);
  const [reviewing, setReviewing] = useState<ClubInvitation | null>(null);

  const load = () =>
    getMyInvitations()
      .then((d) => setInvitations(d.invitations))
      .catch(() => setInvitations([]));

  useEffect(() => {
    load();
  }, []);

  if (invitations === null) return <Skeleton style={{ width: "100%", height: 48 }} />;

  return (
    <>
      {invitations.length === 0 ? (
        <EmptyState icon="📨" title="No club invitations" desc="When a club manager recruits you, the offer lands here." />
      ) : (
        <ul className="eb-inv-list">
          {invitations.map((inv) => (
            <li key={inv.id}>
              <span className="eb-club-emblem sm">
                {inv.club_emblem_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={inv.club_emblem_url} alt="" />
                ) : (
                  inv.club_name.charAt(0).toUpperCase()
                )}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b>{inv.club_name}</b> invites you · {inv.club_rank_points.toLocaleString()} pts
              </span>
              <button className="btn btn-gd btn-sm" onClick={() => setReviewing(inv)}>
                Review Contract
              </button>
            </li>
          ))}
        </ul>
      )}
      {reviewing ? (
        <ContractModal
          inv={reviewing}
          onClose={() => setReviewing(null)}
          onSigned={() => {
            setReviewing(null);
            load();
          }}
        />
      ) : null}
    </>
  );
}
