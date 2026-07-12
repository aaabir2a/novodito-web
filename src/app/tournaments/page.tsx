import type { Metadata } from "next";
import EventCard from "@/components/cards/EventCard";
import type { EventItem, EventTheme } from "@/lib/data";
import { getTournaments, type ApiTournament, ApiError } from "@/lib/api";

export const metadata: Metadata = {
  title: "Tournaments",
  description:
    "All 2026 eFootball tournaments with brackets, schedules, and live status.",
};

const THEMES: EventTheme[] = ["gold", "lime", "cyan", "purple", "red", "orange"];
const MODE_EMOJI: Record<ApiTournament["mode"], string> = {
  LAN: "🏆",
  Online: "🌐",
  Hybrid: "⚡",
};

function bdt(n: number): string {
  return `৳${Math.round(n).toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Map a backend tournament to the EventItem shape the UI already renders. */
function toEventItem(t: ApiTournament, i: number): EventItem {
  const live = t.status === "Ongoing";
  return {
    id: i,
    name: t.name,
    date: formatDate(t.starts_at),
    prize: bdt(t.prize_pool_bdt),
    players: `${t.filled_slots}/${t.max_slots}`,
    location: t.mode,
    emoji: MODE_EMOJI[t.mode] ?? "🏆",
    status: t.slots_full ? "Full" : t.status === "Registration" ? "Reg. Open" : t.status,
    type: live ? "live" : "upcoming",
    theme: THEMES[i % THEMES.length],
  };
}

export default async function Page() {
  let items: EventItem[] = [];
  let error: string | null = null;

  try {
    // status="" → all statuses, not just Registration
    const data = await getTournaments({ status: "", limit: 50 });
    items = data.tournaments.map(toEventItem);
  } catch (e) {
    error =
      e instanceof ApiError
        ? `Backend returned ${e.status}. Is the API server running?`
        : "Could not reach the backend API.";
  }

  return (
    <div className="page act" id="page-tournaments" style={{ padding: "2rem 1.25rem 4rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 className="ht" style={{ fontSize: "2.2rem", marginBottom: ".5rem" }}>
          <span className="go">TOURNAMENTS</span>
        </h1>
        <p className="hd" style={{ marginBottom: "2rem" }}>
          Live from the eBattleVerse API — {items.length} event
          {items.length === 1 ? "" : "s"}.
        </p>

        {error ? (
          <div
            style={{
              padding: "1.25rem",
              border: "1px solid rgba(255,60,60,.4)",
              borderRadius: 12,
              color: "rgba(255,120,120,.95)",
              background: "rgba(255,40,40,.06)",
            }}
          >
            ⚠️ {error}
          </div>
        ) : items.length === 0 ? (
          <p className="hd">No tournaments yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "1.5rem",
              gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            }}
          >
            {items.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
