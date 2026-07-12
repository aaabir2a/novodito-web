"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import RequireAuth from "@/components/auth/RequireAuth";
import type { PlayerProfile } from "@/lib/api";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        padding: ".7rem 0",
        borderBottom: "1px solid rgba(255,255,255,.07)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--fh)",
          fontSize: ".72rem",
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "rgba(200,190,225,.7)",
        }}
      >
        {label}
      </span>
      <span style={{ color: "#fff", textAlign: "right", wordBreak: "break-word" }}>
        {value || <span style={{ color: "rgba(180,170,205,.45)" }}>—</span>}
      </span>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "gray" | "red" }) {
  const colors = {
    green: ["rgba(0,255,127,.12)", "rgba(0,255,127,.4)", "rgba(120,255,180,.95)"],
    gray: ["rgba(255,255,255,.06)", "rgba(255,255,255,.16)", "rgba(210,205,225,.85)"],
    red: ["rgba(255,40,40,.1)", "rgba(255,60,60,.4)", "rgba(255,140,140,.95)"],
  }[tone];
  return (
    <span
      style={{
        display: "inline-block",
        padding: ".22rem .6rem",
        borderRadius: 999,
        fontSize: ".72rem",
        fontFamily: "var(--fh)",
        letterSpacing: ".05em",
        background: colors[0],
        border: `1px solid ${colors[1]}`,
        color: colors[2],
      }}
    >
      {children}
    </span>
  );
}

function ProfileView({ user }: { user: PlayerProfile }) {
  const { logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    await logout();
    toast.success("You have been logged out.");
    router.replace("/login");
  }

  const location = [user.location_city, user.location_division, user.location_region, user.location_country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="page act" style={{ padding: "3rem 1.25rem 5rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <h1 className="ht" style={{ fontSize: "2.2rem", marginBottom: ".35rem" }}>
              <span className="go">{user.username}</span>
            </h1>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              <Badge tone="gray">{user.platform_role}</Badge>
              <Badge tone="gray">{user.leaderboard_tier}</Badge>
              {user.is_verified ? <Badge tone="green">Verified</Badge> : <Badge tone="gray">Unverified</Badge>}
              {user.is_banned ? <Badge tone="red">Banned</Badge> : null}
            </div>
          </div>
          <div style={{ display: "flex", gap: ".6rem" }}>
            <Link href="/profile/edit" className="btn btn-lm btn-sm">✏️ Edit</Link>
            <button className="btn btn-gh btn-sm" onClick={onLogout} disabled={busy}>
              {busy ? "…" : "Log out"}
            </button>
          </div>
        </div>

        <div
          style={{
            border: "1px solid rgba(255,184,0,.14)",
            background: "linear-gradient(180deg,rgba(20,12,40,.6),rgba(6,0,24,.6))",
            borderRadius: 16,
            padding: "1.5rem 1.75rem",
          }}
        >
          <Row label="Legal name" value={user.legal_name} />
          <Row label="Device" value={`${user.device_type}${user.console_type ? ` · ${user.console_type}` : ""}`} />
          <Row label="Konami ID" value={user.konami_id} />
          <Row label="Hometown" value={user.hometown} />
          <Row label="Location" value={location} />
          <Row label="Birthday" value={user.birthday} />
          <Row label="Blood group" value={user.blood_group} />
          <Row
            label="Facebook"
            value={user.facebook_url ? <a href={user.facebook_url} target="_blank" rel="noreferrer" className="go">Link</a> : ""}
          />
          <Row
            label="Discord"
            value={user.discord_url ? <a href={user.discord_url} target="_blank" rel="noreferrer" className="go">Link</a> : ""}
          />
          <Row
            label="Konami portal"
            value={user.konami_portal_url ? <a href={user.konami_portal_url} target="_blank" rel="noreferrer" className="go">Link</a> : ""}
          />
          <Row label="Member since" value={new Date(user.created_at).toLocaleDateString()} />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileGate />
    </RequireAuth>
  );
}

function ProfileGate() {
  const { user } = useAuth();
  // RequireAuth guarantees user is non-null here.
  return <ProfileView user={user!} />;
}
