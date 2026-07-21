"use client";

// Dual-currency wallet pill (REQ-44/45): always-visible balances in the navbar
// for authenticated players. Fetches real balances (Phase 5), refreshes when
// the drawer opens, and links through to the full /wallet page.

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCoinBalance, getSCoinBalance } from "@/lib/api";
import CoinIcon from "./CoinIcon";
import { CountUp } from "./Realtime";

export default function WalletPill() {
  const [open, setOpen] = useState(false);
  const [battle, setBattle] = useState(0);
  const [sCoins, setSCoins] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    getCoinBalance().then((d) => setBattle(d.balance)).catch(() => null);
    getSCoinBalance().then((d) => setSCoins(d.s_coin_balance)).catch(() => null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // close on outside click / Escape; refresh when opening
  useEffect(() => {
    if (!open) return;
    refresh();
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, refresh]);

  return (
    <div className="eb-wallet" ref={rootRef}>
      <button
        className="eb-wallet-pill"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Wallet"
      >
        <span className="eb-wallet-bal bc">
          <CoinIcon type="battle" size={15} />
          <CountUp value={battle} />
        </span>
        <span className="eb-wallet-bal sc">
          <CoinIcon type="s" size={15} />
          <CountUp value={sCoins} />
        </span>
      </button>

      {open ? (
        <div className="eb-wallet-drawer" role="dialog" aria-label="Wallet balances">
          <div className="eb-wallet-lane">
            <span className="ln">
              <CoinIcon type="battle" size={20} /> Battle Coins
            </span>
            <span className="amt">{battle.toLocaleString()}</span>
          </div>
          <div className="eb-wallet-lane">
            <span className="ln">
              <CoinIcon type="s" size={20} /> S Coins
            </span>
            <span className="amt">{sCoins.toLocaleString()}</span>
          </div>
          <p className="eb-wallet-note">
            Battle Coins power challenges and chat perks. S Coins buy cosmetics
            and merch — they never affect competition.
          </p>
          <Link className="btn btn-lm btn-sm" href="/wallet" style={{ justifyContent: "center" }} onClick={() => setOpen(false)}>
            Open Wallet →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
