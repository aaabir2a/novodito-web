"use client";

// REQ-40 — one-tap matchmaking. Join → 4s status poll → offer takeover →
// accept/decline. Tier-expansion hint mirrors backend fallback windows
// (±1 tier after 30s, ±2 after 90s, any after 3min).

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  joinQueue,
  leaveQueue,
  getQueueStatus,
  respondToOffer,
  type QueuePlatform,
  type QueueMode,
  type QueueStatus,
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const PLATFORMS: QueuePlatform[] = ["PS5", "Xbox", "PC", "Mobile"];

function tierHint(elapsed: number): string {
  if (elapsed < 30) return "searching your rank tier…";
  if (elapsed < 90) return "widening search: ±1 rank tier…";
  if (elapsed < 180) return "widening search: ±2 rank tiers…";
  return "matching with any available player…";
}

export default function MatchmakingWidget({ defaultPlatform = "PS5" }: { defaultPlatform?: QueuePlatform }) {
  const toast = useToast();
  const [platform, setPlatform] = useState<QueuePlatform>(defaultPlatform);
  const [mode, setMode] = useState<QueueMode>("ranked");
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const joinedAt = useRef<number | null>(null);

  const inQueue = status?.in_queue ?? false;
  const offer = status?.pending_offer ?? null;

  const refresh = useCallback(async () => {
    try {
      const s = await getQueueStatus();
      setStatus(s);
      if (!s.in_queue) joinedAt.current = null;
    } catch {
      /* poll failure is non-fatal; next tick retries */
    }
  }, []);

  // poll every 4s while queued (or until first status known)
  useEffect(() => {
    refresh();
    const iv = setInterval(() => {
      if (joinedAt.current != null || status?.in_queue) refresh();
    }, 4000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, status?.in_queue]);

  // local elapsed ticker
  useEffect(() => {
    if (!inQueue) {
      setElapsed(0);
      return;
    }
    if (joinedAt.current == null) joinedAt.current = Date.now();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - (joinedAt.current ?? Date.now())) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [inQueue]);

  const join = async () => {
    setBusy(true);
    try {
      await joinQueue(platform, mode);
      joinedAt.current = Date.now();
      await refresh();
      toast.success("In queue — hold tight");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not join queue");
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    try {
      await leaveQueue();
      joinedAt.current = null;
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const respond = async (accept: boolean) => {
    if (!offer) return;
    setBusy(true);
    try {
      await respondToOffer(String(offer.offer_id), accept);
      if (accept) toast.success("Match accepted — good luck! 🔥");
      else toast.toast("Declined. 3 declines = 10-minute cooldown.", "info");
      await refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Response failed");
    } finally {
      setBusy(false);
    }
  };

  /* Offer takeover */
  if (offer) {
    return (
      <div className="eb-mm offer">
        <div className="eb-mm-found">⚔️ MATCH FOUND</div>
        {offer.opponent_username ? <div className="eb-mm-opp">vs <b>{String(offer.opponent_username)}</b></div> : null}
        <div className="eb-mm-actions">
          <button className="btn btn-lm btn-sm" disabled={busy} onClick={() => respond(true)}>✓ Accept</button>
          <button className="btn btn-gh btn-sm" disabled={busy} onClick={() => respond(false)}>Decline</button>
        </div>
        <p className="eb-mm-hint">3 declines trigger a 10-minute queue cooldown.</p>
      </div>
    );
  }

  if (inQueue) {
    return (
      <div className="eb-mm queued">
        <div className="eb-mm-spin" aria-hidden />
        <div className="eb-mm-state">
          <b>In queue · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</b>
          <span>{tierHint(elapsed)}</span>
        </div>
        <button className="btn btn-gh btn-sm" disabled={busy} onClick={leave}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="eb-mm">
      <div className="eb-mm-opts">
        <select aria-label="Platform" value={platform} onChange={(e) => setPlatform(e.target.value as QueuePlatform)}>
          {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select aria-label="Mode" value={mode} onChange={(e) => setMode(e.target.value as QueueMode)}>
          <option value="ranked">Ranked</option>
          <option value="unranked">Unranked</option>
        </select>
      </div>
      <button className="btn btn-lm" disabled={busy} onClick={join}>⚡ Find Match</button>
    </div>
  );
}
