"use client";

// Phase 5 — Wallet (REQ-44/45). Two strictly separated lanes: Battle Coins
// (competitive) and S Coins (cosmetic). Ledger rows show plain-language earn/
// spend reasons. P2P transfer (REQ-51) with confirm sheet + recipient identity
// — misdirected coins are the top support risk, so the confirm step is explicit.

import { useCallback, useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import CoinIcon from "@/components/system/CoinIcon";
import IdentityChip from "@/components/system/IdentityChip";
import { CountUp, EmptyState, Skeleton } from "@/components/system/Realtime";
import { useToast } from "@/components/ui/Toast";
import {
  ApiError,
  getCoinLedger,
  getSCoinLedger,
  getTransferLimits,
  lookupPlayer,
  transferCoins,
  type CoinTx,
  type SCoinTx,
  type TransferLimits,
} from "@/lib/api";

const REASON_LABEL: Record<string, string> = {
  tournament_win: "Tournament win",
  seasonal_top20: "Seasonal Top 20 reward",
  challenge_win: "Challenge win",
  challenge_stake: "Challenge stake",
  milestone_reward: "Milestone reward",
  milestone: "Milestone reward",
  watch_earn: "Watch-to-earn",
  win_streak: "Win streak bonus",
  p2p_send: "Sent to player",
  p2p_receive: "Received from player",
  p2p_transfer_send: "Sent to player",
  p2p_transfer_receive: "Received from player",
  p2p_transfer_out: "Sent to player",
  p2p_transfer_in: "Received from player",
  card_asset_purchase: "Card Studio purchase",
  admin_adjustment: "Admin adjustment",
  purchase: "Store purchase",
};
const label = (r: string) => REASON_LABEL[r] ?? r.replace(/_/g, " ");
const fmtT = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function TransferBox({ onSent }: { onSent: () => void }) {
  const toast = useToast();
  const [limits, setLimits] = useState<TransferLimits | null>(null);
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState(5);
  const [confirming, setConfirming] = useState<{ id: string; username: string; photo: string | null } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getTransferLimits().then(setLimits).catch(() => null);
  }, []);

  const review = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const p = await lookupPlayer(username.trim());
      setConfirming({ id: p.id, username: p.username, photo: p.profile_photo_url });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Player not found");
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!confirming) return;
    setBusy(true);
    try {
      await transferCoins(confirming.id, amount);
      toast.success(`Sent ${amount} Battle Coins to ${confirming.username} ⚡`);
      setConfirming(null);
      setUsername("");
      onSent();
      getTransferLimits().then(setLimits).catch(() => null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Transfer failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <form className="eb-club-create" onSubmit={review}>
        <input required placeholder="Recipient username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input
          required type="number" min={1} max={limits?.per_tx_max ?? 10}
          value={amount} style={{ maxWidth: 90 }}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button className="btn btn-gd btn-sm" disabled={busy} type="submit">Review →</button>
      </form>
      {limits ? (
        <p className="eb-wallet-note" style={{ marginTop: ".5rem" }}>
          Max {limits.per_tx_max} per transfer · you can still send {limits.daily_send_remaining} today.
        </p>
      ) : null}

      {confirming ? (
        <>
          <div className="eb-sheet-scrim" style={{ zIndex: 750 }} onClick={() => setConfirming(null)} />
          <div className="eb-contract-modal" role="dialog" aria-label="Confirm transfer">
            <h3>⚡ Confirm Transfer</h3>
            <p className="cl">Sending</p>
            <p className="cv" style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
              <CoinIcon type="battle" size={18} /> {amount} Battle Coins
            </p>
            <p className="cl">To</p>
            <div style={{ margin: ".3rem 0 .8rem" }}>
              <IdentityChip name={confirming.username} avatarUrl={confirming.photo} size="md" />
            </div>
            <p className="eb-wallet-note">Transfers are instant and cannot be reversed. Check the recipient carefully.</p>
            <div style={{ display: "flex", gap: ".6rem", marginTop: "1rem" }}>
              <button className="btn btn-lm btn-sm" disabled={busy} onClick={send}>
                {busy ? "Sending…" : "✓ Send Coins"}
              </button>
              <button className="btn btn-gh btn-sm" onClick={() => setConfirming(null)}>Cancel</button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function WalletInner() {
  const [lane, setLane] = useState<"battle" | "s">("battle");
  const [bc, setBc] = useState<{ balance: number; transactions: CoinTx[] } | null>(null);
  const [sc, setSc] = useState<{ s_coin_balance: number; transactions: SCoinTx[] } | null>(null);

  const load = useCallback(() => {
    getCoinLedger().then(setBc).catch(() => setBc({ balance: 0, transactions: [] }));
    getSCoinLedger().then(setSc).catch(() => setSc({ s_coin_balance: 0, transactions: [] }));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const txs: { id: string; amount: number; credit: boolean; reason: string; at: string }[] =
    lane === "battle"
      ? (bc?.transactions ?? []).map((t) => ({ id: t.id, amount: t.amount, credit: t.direction === "credit", reason: t.reason, at: t.created_at }))
      : (sc?.transactions ?? []).map((t) => ({ id: t.id, amount: t.amount, credit: t.transaction_type === "credit", reason: t.reason, at: t.created_at }));

  return (
    <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 className="ht" style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>
          <span className="go">WALLET</span>
        </h1>

        {/* Dual lanes */}
        <div className="eb-wallet-lanes">
          <button className={`eb-lane bc${lane === "battle" ? " on" : ""}`} onClick={() => setLane("battle")}>
            <CoinIcon type="battle" size={34} />
            <span className="amt">{bc ? <CountUp value={bc.balance} /> : "—"}</span>
            <span className="nm">Battle Coins</span>
            <span className="ds">Competitive: challenges, chat perks, ad-free</span>
          </button>
          <button className={`eb-lane sc${lane === "s" ? " on" : ""}`} onClick={() => setLane("s")}>
            <CoinIcon type="s" size={34} />
            <span className="amt">{sc ? <CountUp value={sc.s_coin_balance} /> : "—"}</span>
            <span className="nm">S Coins</span>
            <span className="ds">Cosmetic: card skins, frames, merch — zero competitive edge</span>
          </button>
        </div>

        <div className="eb-pf-grid" style={{ marginTop: "1.2rem" }}>
          <section className="eb-pf-card wide">
            <h3>{lane === "battle" ? "Battle Coin" : "S Coin"} history</h3>
            {(lane === "battle" ? bc : sc) === null ? (
              <Skeleton style={{ width: "100%", height: 90 }} />
            ) : txs.length === 0 ? (
              <EmptyState
                icon="🪙"
                title="No transactions yet"
                desc={lane === "battle"
                  ? "Win tournaments (+5), keep streaks (+1 per 2 wins), or watch streams to earn."
                  : "Season Top-20 finishes and milestones earn S Coins."}
              />
            ) : (
              <ul className="eb-tx-list">
                {txs.map((t) => (
                  <li key={t.id}>
                    <span className={`dir${t.credit ? " in" : ""}`}>{t.credit ? "+" : "−"}{t.amount}</span>
                    <span className="rs">{label(t.reason)}</span>
                    <time>{fmtT(t.at)}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="eb-pf-card wide">
            <h3>P2P Battle Coin transfer</h3>
            <TransferBox onSent={load} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <RequireAuth>
      <WalletInner />
    </RequireAuth>
  );
}
