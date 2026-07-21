"use client";

// Tournament management (FR-014…018): list every tournament + create new.
// Create posts to POST /tournaments/create/ (admin/master only, backend
// enforces: name 5-200, slots 2-256, future start, end after start).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ApiError,
  createTournament,
  getTournaments,
  type ApiTournament,
  type TournamentCreateInput,
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/system/StatusBadge";
import { EmptyState, Skeleton } from "@/components/system/Realtime";

const bdt = (n: number) => `৳${n.toLocaleString()}`;

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "",
    mode: "Online" as TournamentCreateInput["mode"],
    bracket_type: "SingleElim" as TournamentCreateInput["bracket_type"],
    max_slots: 64,
    entry_fee_bdt: 300,
    prize_pool_bdt: 10000,
    starts_at: "",
    ends_at: "",
    venue: "",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createTournament({
        name: f.name.trim(),
        mode: f.mode,
        bracket_type: f.bracket_type,
        max_slots: Number(f.max_slots),
        entry_fee_bdt: Number(f.entry_fee_bdt),
        prize_pool_bdt: Number(f.prize_pool_bdt),
        // datetime-local gives "YYYY-MM-DDTHH:mm" — parseable by Django
        starts_at: new Date(f.starts_at).toISOString(),
        ends_at: new Date(f.ends_at).toISOString(),
        venue_metadata: f.venue.trim() ? { venue: f.venue.trim() } : undefined,
      });
      toast.success(`Tournament "${f.name.trim()}" created 🏆`);
      setF((p) => ({ ...p, name: "", starts_at: "", ends_at: "", venue: "" }));
      onCreated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  const L = ({ t }: { t: string }) => (
    <p className="cl" style={{ margin: ".55rem 0 .2rem" }}>{t}</p>
  );

  return (
    <form onSubmit={submit} className="eb-pf-card" style={{ marginBottom: "1.2rem" }}>
      <h3>Create tournament</h3>
      <L t="Name * (5–200 chars)" />
      <input className="eb-admin-search" style={{ maxWidth: "none" }} required minLength={5} maxLength={200}
        placeholder="e.g. Rajshahi Regional 2026" value={f.name} onChange={(e) => set("name", e.target.value)} />

      <div className="eb-reg-row" style={{ flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 130 }}>
          <L t="Mode" />
          <select className="eb-admin-role" style={{ width: "100%", padding: ".5rem" }} value={f.mode}
            onChange={(e) => set("mode", e.target.value as TournamentCreateInput["mode"])}>
            <option>Online</option><option>LAN</option><option>Hybrid</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <L t="Bracket" />
          <select className="eb-admin-role" style={{ width: "100%", padding: ".5rem" }} value={f.bracket_type}
            onChange={(e) => set("bracket_type", e.target.value as TournamentCreateInput["bracket_type"])}>
            <option>SingleElim</option><option>DoubleElim</option><option>RoundRobin</option>
          </select>
        </div>
        <div style={{ width: 110 }}>
          <L t="Max slots" />
          <input className="eb-admin-search" style={{ maxWidth: "none" }} type="number" min={2} max={256}
            value={f.max_slots} onChange={(e) => set("max_slots", Number(e.target.value))} />
        </div>
      </div>

      <div className="eb-reg-row" style={{ flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <L t="Entry fee (BDT)" />
          <input className="eb-admin-search" style={{ maxWidth: "none" }} type="number" min={0}
            value={f.entry_fee_bdt} onChange={(e) => set("entry_fee_bdt", Number(e.target.value))} />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <L t="Prize pool (BDT)" />
          <input className="eb-admin-search" style={{ maxWidth: "none" }} type="number" min={0}
            value={f.prize_pool_bdt} onChange={(e) => set("prize_pool_bdt", Number(e.target.value))} />
        </div>
      </div>

      <div className="eb-reg-row" style={{ flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 190 }}>
          <L t="Starts * (must be future)" />
          <input className="eb-admin-search" style={{ maxWidth: "none" }} type="datetime-local" required
            value={f.starts_at} onChange={(e) => set("starts_at", e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 190 }}>
          <L t="Ends * (after start)" />
          <input className="eb-admin-search" style={{ maxWidth: "none" }} type="datetime-local" required
            value={f.ends_at} onChange={(e) => set("ends_at", e.target.value)} />
        </div>
      </div>

      <L t="Venue (optional)" />
      <input className="eb-admin-search" style={{ maxWidth: "none", marginBottom: ".9rem" }}
        placeholder="e.g. Dhaka Esports Arena, Hall 2" value={f.venue} onChange={(e) => set("venue", e.target.value)} />

      <button className="btn btn-lm btn-sm" type="submit" disabled={busy}>
        {busy ? "Creating…" : "🏆 Create Tournament"}
      </button>
    </form>
  );
}

export default function AdminTournamentsTab() {
  const [rows, setRows] = useState<ApiTournament[] | null>(null);

  const load = useCallback(() => {
    getTournaments({ status: "", limit: 50 })
      .then((d) => setRows(d.tournaments))
      .catch(() => setRows([]));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <CreateForm onCreated={load} />

      {rows === null ? (
        <Skeleton style={{ width: "100%", height: 120 }} />
      ) : rows.length === 0 ? (
        <EmptyState icon="🏆" title="No tournaments yet" desc="Create the first event above." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="eb-pf-table">
            <thead>
              <tr><th>Name</th><th>Mode</th><th>Slots</th><th>Entry</th><th>Prize</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td style={{ fontFamily: "var(--fo)", fontSize: ".7rem", color: "var(--gold)" }}>{t.mode}</td>
                  <td>{t.filled_slots}/{t.max_slots}</td>
                  <td>{bdt(t.entry_fee_bdt)}</td>
                  <td>{bdt(t.prize_pool_bdt)}</td>
                  <td>
                    <StatusBadge
                      kind={t.status === "Ongoing" ? "live" : t.status === "Completed" ? "verified" : t.status === "Registration" ? "pending" : "neutral"}
                      label={t.status}
                    />
                  </td>
                  <td><Link href={`/tournaments/${t.id}`} style={{ color: "var(--lime)", fontSize: ".72rem" }}>View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
