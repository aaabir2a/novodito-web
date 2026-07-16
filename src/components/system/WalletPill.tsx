"use client";

// Dual-currency wallet pill (REQ-44/45): always-visible balances in the navbar
// for authenticated players; tap opens a drawer with the two separated lanes.
// Balances are wired to the economy API in Phase 5 — until then callers pass
// whatever the session knows (defaults 0).

import { useEffect, useRef, useState } from "react";
import CoinIcon from "./CoinIcon";
import { CountUp } from "./Realtime";

export default function WalletPill({
  battle = 0,
  sCoins = 0,
}: {
  battle?: number;
  sCoins?: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
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
  }, [open]);

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
        </div>
      ) : null}
    </div>
  );
}
