import { Player } from "@/lib/data";

const tierTitle = (p: Player) => {
  if (p.tier === "PRO") return "GRAND CHAMPION";
  if (p.tier === "ELITE") return "ELITE PLAYER";
  if (p.tier === "RISING") return "RISING STAR";
  return "PLAYER";
};

const rankClass = (i: number) => (i === 0 ? "r1" : i === 1 ? "r2" : i === 2 ? "r3" : "");
const rankLabel = (i: number) =>
  i === 0 ? "🥇 #1" : i === 1 ? "🥈 #2" : i === 2 ? "🥉 #3" : `#${i + 1}`;

export default function TopPlayerCard({ p, i }: { p: Player; i: number }) {
  const statusClass = p.online ? "active" : "offline";
  const statusText = p.online ? "ACTIVE" : "OFFLINE";
  const ribbon = p.club ? p.club.toUpperCase().slice(0, 20) : "FREE AGENT";

  return (
    <div className="ntp-card">
      <div className={`ntp-rank ${rankClass(i)}`}>{rankLabel(i)}</div>
      <div className={`ntp-online-dot ${statusClass}`} title={statusText} />

      <div className="ntp-shield">
        <div className="ntp-shield-bg" />
        <div className="ntp-shield-crown">👑</div>
        <div className="ntp-shield-photo">
          <span style={{ fontSize: "1.7rem" }}>👤</span>
        </div>
        <div className="ntp-shield-ribbon">{ribbon}</div>
      </div>

      <div className="ntp-name" title={p.name}>
        {p.name}
      </div>
      <div className="ntp-title">{tierTitle(p)}</div>

      <div className="ntp-stat-row">
        <div className="ntp-stat">
          <div className="ntp-stat-val">{p.wins}</div>
          <div className="ntp-stat-lbl">Wins</div>
        </div>
        <div className="ntp-stat">
          <div className="ntp-stat-val">{p.goals}</div>
          <div className="ntp-stat-lbl">Goals</div>
        </div>
        <div className="ntp-stat">
          <div className="ntp-stat-val">{p.matches}</div>
          <div className="ntp-stat-lbl">Played</div>
        </div>
      </div>

      {p.club && <div className="ntp-club">🏟️ {p.club}</div>}

      <div className={`ntp-status-bar ${statusClass}`}>
        <span className="dot" />
        <span className="lbl">{statusText}</span>
      </div>

      {p.joined && <div className="ntp-joined">📅 {p.joined}</div>}
    </div>
  );
}
