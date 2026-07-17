"use client";

// Phase 3 — Club directory (§1.4). Public list ordered by rank points,
// plus create-club flow for authenticated players.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, createClub, getClubs, type ClubListItem } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { Skeleton, EmptyState } from "@/components/system/Realtime";

function CreateClubForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [homeBase, setHomeBase] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await createClub({ name: name.trim(), home_base: homeBase.trim() || undefined, admin_pin: pin });
      toast.success(`Club "${name.trim()}" founded 🛡️`);
      onDone();
      router.push(`/clubs/${res.club_id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create club");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="eb-club-create" onSubmit={submit}>
      <input required minLength={3} maxLength={80} placeholder="Club name" value={name} onChange={(e) => setName(e.target.value)} />
      <input maxLength={120} placeholder="Home base (city)" value={homeBase} onChange={(e) => setHomeBase(e.target.value)} />
      <input required minLength={6} maxLength={12} placeholder="Admin PIN (6+ chars)" type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
      <button className="btn btn-lm btn-sm" disabled={busy} type="submit">
        {busy ? "Founding…" : "🛡️ Found Club"}
      </button>
    </form>
  );
}

export default function ClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<ClubListItem[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => getClubs().then((d) => setClubs(d.clubs)).catch(() => setClubs([]));
  useEffect(() => {
    load();
  }, []);

  return (
    <div
      className="page act"
      style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <h1 className="ht" style={{ fontSize: "2.2rem" }}><span className="ac">CLUBS</span></h1>
          {user ? (
            <button className="btn btn-gd btn-sm" onClick={() => setShowCreate((s) => !s)}>
              {showCreate ? "✕ Cancel" : "+ Found a Club"}
            </button>
          ) : null}
        </div>

        {showCreate ? (
          <div className="eb-pf-card" style={{ marginBottom: "1.2rem" }}>
            <h3>Found a new club</h3>
            <CreateClubForm onDone={() => { setShowCreate(false); load(); }} />
            <p className="eb-wallet-note" style={{ marginTop: ".6rem" }}>
              You become the club manager. The admin PIN protects club actions — don&apos;t share it.
            </p>
          </div>
        ) : null}

        {clubs === null ? (
          <div className="eb-sys-grid">
            {[...Array(3)].map((_, i) => <Skeleton key={i} style={{ width: "100%", height: 110 }} />)}
          </div>
        ) : clubs.length === 0 ? (
          <EmptyState
            icon="🛡️"
            title="No clubs yet"
            desc="Found the first club of the league and start recruiting."
            action={!user ? <Link className="btn btn-lm btn-sm" href="/login?next=/clubs">Sign in to found one</Link> : undefined}
          />
        ) : (
          <div className="eb-sys-grid">
            {clubs.map((c, i) => (
              <Link key={c.id} href={`/clubs/${c.id}`} className="eb-club-card">
                <span className="eb-club-emblem">
                  {c.emblem_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.emblem_url} alt="" />
                  ) : (
                    c.name.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="eb-club-body">
                  <b>#{i + 1} {c.name}</b>
                  <span className="sub">
                    {c.home_base ? `📍 ${c.home_base} · ` : ""}👥 {c.roster_count}/40 · mgr {c.manager_username}
                  </span>
                </span>
                <span className="eb-club-pts">{c.rank_points.toLocaleString()} pts</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
