"use client";

// Admin dashboard — live operational counters (§1.11). Polls every 15s.

import { useEffect, useState } from "react";
import { getAdminDashboard, type AdminDashboard } from "@/lib/api";
import { Skeleton } from "@/components/system/Realtime";

const CARDS: { key: keyof AdminDashboard; label: string; accent?: "gold" | "lime" }[] = [
  { key: "pending_payments", label: "Pending Payments", accent: "gold" },
  { key: "disputed_battles", label: "Disputed Battles", accent: "gold" },
  { key: "active_matches", label: "Active Matches", accent: "lime" },
  { key: "active_users_now", label: "Active Users", accent: "lime" },
  { key: "pending_transfers", label: "Pending Transfers" },
  { key: "total_players", label: "Total Players" },
  { key: "total_clubs", label: "Total Clubs" },
];

export default function AdminDashboardTab() {
  const [data, setData] = useState<AdminDashboard | null>(null);

  useEffect(() => {
    const load = () => getAdminDashboard().then(setData).catch(() => null);
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);

  if (!data) return <Skeleton style={{ width: "100%", height: 120 }} />;

  return (
    <div className="eb-pf-stats" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
      {CARDS.map((c) => (
        <div key={c.key} className={`eb-stat-tile${c.accent ? ` ${c.accent}` : ""}`}>
          <span className="v">{data[c.key]}</span>
          <span className="l">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
