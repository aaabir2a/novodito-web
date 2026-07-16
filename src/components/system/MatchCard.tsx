// Match card family — one skeleton, three states (upcoming / live / completed).
// Used on home feed (FR-011), fixtures/match centre (FR-004), club pages.

import StatusBadge from "./StatusBadge";

export interface MatchSide {
  name: string;
  logoUrl?: string | null;
  score?: number | null;
}

export interface MatchCardProps {
  status: "upcoming" | "live" | "completed";
  home: MatchSide;
  away: MatchSide;
  /** e.g. "Club Match · League" or "Solo Battle" */
  context?: string;
  /** Kickoff time or elapsed label, e.g. "Fri 21:00" / "34'" */
  timeLabel?: string;
  /** e.g. "+8 pts" — point transparency (REQ-46) */
  pointsLabel?: string;
  href?: string;
}

function Side({ side, winner, right }: { side: MatchSide; winner: boolean; right?: boolean }) {
  return (
    <div className={`eb-mcard-team${right ? " right" : ""}${winner ? " winner" : ""}`}>
      {side.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={side.logoUrl} alt="" width={26} height={26} style={{ borderRadius: "50%", flexShrink: 0 }} loading="lazy" />
      ) : (
        <span
          aria-hidden
          style={{
            width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
            display: "grid", placeItems: "center",
            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.15)",
            fontFamily: "var(--fh)", fontSize: ".8rem", color: "rgba(220,235,225,.85)",
          }}
        >
          {side.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="eb-mcard-tname">{side.name}</span>
    </div>
  );
}

export default function MatchCard({
  status,
  home,
  away,
  context,
  timeLabel,
  pointsLabel,
}: MatchCardProps) {
  const done = status === "completed";
  const live = status === "live";
  const homeWin = done && home.score != null && away.score != null && home.score > away.score;
  const awayWin = done && home.score != null && away.score != null && away.score > home.score;

  return (
    <div className={`eb-mcard${live ? " live" : ""}`}>
      <div className="eb-mcard-top">
        <span>{context ?? "Match"}</span>
        {live ? <StatusBadge kind="live" /> : done ? (
          homeWin || awayWin ? null : <StatusBadge kind="draw" />
        ) : (
          <StatusBadge kind="neutral" label="Upcoming" />
        )}
      </div>

      <div className="eb-mcard-row">
        <Side side={home} winner={homeWin} />
        <div className="eb-mcard-score">
          {status === "upcoming" ? (
            <span className="eb-mcard-vs">VS</span>
          ) : (
            <>
              <span className={homeWin ? "w" : undefined}>{home.score ?? 0}</span>
              <span className="eb-mcard-vs">–</span>
              <span className={awayWin ? "w" : undefined}>{away.score ?? 0}</span>
            </>
          )}
        </div>
        <Side side={away} winner={awayWin} right />
      </div>

      {(timeLabel || pointsLabel) && (
        <div className="eb-mcard-foot">
          <span>{timeLabel ?? ""}</span>
          {pointsLabel ? <span className="eb-mcard-pts">{pointsLabel}</span> : null}
        </div>
      )}
    </div>
  );
}
