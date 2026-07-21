"use client";

// Phase 0 exit criteria: in-app reference page for the eb-* design system.
// Not linked from nav — visit /system directly. Every later phase composes
// from what's on this page.

import CoinIcon from "@/components/system/CoinIcon";
import StatusBadge from "@/components/system/StatusBadge";
import IdentityChip from "@/components/system/IdentityChip";
import MatchCard from "@/components/system/MatchCard";
import FilterBar, { useFilters } from "@/components/system/FilterBar";
import WalletPill from "@/components/system/WalletPill";
import NotificationBell from "@/components/system/NotificationBell";
import { CountUp, Skeleton, EmptyState, LiveDot } from "@/components/system/Realtime";
import { useState } from "react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="eb-sys-sec">
      <h2 className="eb-sys-h">{title}</h2>
      {children}
    </section>
  );
}

export default function SystemPage() {
  const [filters, setFilters] = useFilters("system-demo");
  const [count, setCount] = useState(1250);

  return (
    <div
      className="page act"
      style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 className="ht" style={{ fontSize: "2rem", marginBottom: ".25rem" }}>
          <span className="go">EB DESIGN SYSTEM</span>
        </h1>
        <p className="hd" style={{ marginBottom: "1rem" }}>
          Phase 0 reference — atomic components every later phase composes from.
        </p>

        <Section title="Coins — REQ-41 (two currencies, never confusable)">
          <div className="eb-sys-row">
            <CoinIcon type="battle" size={48} />
            <CoinIcon type="battle" size={28} />
            <CoinIcon type="battle" size={16} />
            <span style={{ width: 24 }} />
            <CoinIcon type="s" size={48} />
            <CoinIcon type="s" size={28} />
            <CoinIcon type="s" size={16} />
          </div>
          <p className="hd" style={{ fontSize: ".8rem" }}>
            Battle Coin = gold + bolt (competitive). S Coin = cyan/violet + orbit + star (cosmetic).
          </p>
        </Section>

        <Section title="Status vocabulary">
          <div className="eb-sys-row">
            <StatusBadge kind="live" />
            <StatusBadge kind="verified" />
            <StatusBadge kind="pending" />
            <StatusBadge kind="conflict" />
            <StatusBadge kind="win" />
            <StatusBadge kind="loss" />
            <StatusBadge kind="draw" />
            <StatusBadge kind="neutral" label="Upcoming" />
          </div>
        </Section>

        <Section title="Identity chips — FR-049 (photo on every row)">
          <div className="eb-sys-row">
            <IdentityChip name="secure_sam" rank={7} platform="console" clubName="Dhaka Titans" verified elite size="lg" />
            <IdentityChip name="player_one" rank={42} platform="mobile" size="md" />
            <IdentityChip name="rifat_99" platform="mobile" size="sm" />
          </div>
        </Section>

        <Section title="Match cards — one skeleton, three states">
          <div className="eb-sys-grid">
            <MatchCard
              status="upcoming"
              home={{ name: "Dhaka Titans" }}
              away={{ name: "Sylhet Strikers" }}
              context="Club Match · League"
              timeLabel="Fri 21:00"
            />
            <MatchCard
              status="live"
              home={{ name: "secure_sam", score: 2 }}
              away={{ name: "player_one", score: 1 }}
              context="Solo Battle"
              timeLabel="34'"
            />
            <MatchCard
              status="completed"
              home={{ name: "Chittagong Kings", score: 5 }}
              away={{ name: "Khulna FC", score: 3 }}
              context="Club War · Day 2"
              timeLabel="Yesterday"
              pointsLabel="+4 war pts"
            />
          </div>
        </Section>

        <Section title="Universal filter bar — REQ-54 (resize <720px for bottom sheet)">
          <FilterBar value={filters} onChange={setFilters} />
          <p className="hd" style={{ fontSize: ".75rem", marginTop: ".6rem" }}>
            Selection persists per page via sessionStorage: {JSON.stringify(filters)}
          </p>
        </Section>

        <Section title="Wallet + notifications (navbar widgets)">
          <div className="eb-sys-row">
            <WalletPill />
            <NotificationBell />
          </div>
        </Section>

        <Section title="Realtime primitives">
          <div className="eb-sys-row">
            <LiveDot />
            <button className="btn btn-gh btn-sm" onClick={() => setCount((c) => c + Math.floor(Math.random() * 500))}>
              CountUp: <CountUp value={count} />
            </button>
            <Skeleton style={{ width: 140, height: 16 }} />
            <Skeleton style={{ width: 40, height: 40, borderRadius: "50%" }} />
          </div>
        </Section>

        <Section title="Empty state">
          <EmptyState
            title="No matches yet"
            desc="Queue up for your first match and it will appear here."
            action={<button className="btn btn-lm btn-sm">⚡ Find Match</button>}
          />
        </Section>
      </div>
    </div>
  );
}
