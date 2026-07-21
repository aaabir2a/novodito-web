"use client";

// Phase 7 — Admin Management Console (§1.11, UJ-006). Dense-data register:
// tables, plain controls, no spectacle. Master/admin gated client-side (the
// backend enforces it too — the UI just avoids showing a wall of 403s).

import { useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/system/Realtime";
import AdminDashboardTab from "@/components/admin/AdminDashboardTab";
import AdminPaymentsTab from "@/components/admin/AdminPaymentsTab";
import AdminPlayersTab from "@/components/admin/AdminPlayersTab";
import AdminAuditTab from "@/components/admin/AdminAuditTab";
import AdminTournamentsTab from "@/components/admin/AdminTournamentsTab";

const TABS = ["Dashboard", "Tournaments", "Payments", "Players", "Audit Log"] as const;
type Tab = (typeof TABS)[number];

const ADMIN_ROLES = ["admin", "sub_admin", "master"];

function Console() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Dashboard");

  if (!user) return null;
  if (!ADMIN_ROLES.includes(user.platform_role ?? "")) {
    return (
      <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <EmptyState
            icon="🔐"
            title="Staff access only"
            desc="The management console is restricted to admin and master accounts."
            action={<Link className="btn btn-lm btn-sm" href="/">← Home</Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".7rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <h1 className="ht" style={{ fontSize: "2rem" }}><span className="go">ADMIN CONSOLE</span></h1>
          <span className="eb-status verified">🔐 {user.platform_role}</span>
        </div>

        <div className="eb-pf-tabs" role="tablist" style={{ marginBottom: "1.2rem" }}>
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t}
              className={`eb-pf-tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab === "Dashboard" && <AdminDashboardTab />}
        {tab === "Tournaments" && <AdminTournamentsTab />}
        {tab === "Payments" && <AdminPaymentsTab />}
        {tab === "Players" && <AdminPlayersTab isMaster={user.platform_role === "master"} />}
        {tab === "Audit Log" && <AdminAuditTab />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth>
      <Console />
    </RequireAuth>
  );
}
