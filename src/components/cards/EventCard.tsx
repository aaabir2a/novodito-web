import Link from "next/link";
import { EventItem, themeColor, themeGlow } from "@/lib/data";

export default function EventCard({
  ev,
  href = "/register",
}: {
  ev: EventItem;
  href?: string;
}) {
  const isLive = ev.type === "live";
  return (
    <div className={`ev3d-card theme-${ev.theme}${isLive ? " is-live" : ""}`}>
      <div className="ev3d-inner">
        <div className="ev3d-banner">
          {ev.img ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ev3d-banner-img" src={ev.img} alt={ev.name} loading="lazy" />
              <div className="ev3d-banner-overlay" />
            </>
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at 50% 50%,${themeGlow[ev.theme]},transparent 65%)`,
              }}
            />
          )}
          <div className="ev3d-banner-emoji" style={{ color: themeColor[ev.theme] }}>
            {ev.emoji}
          </div>
          <div className="ev3d-status">
            {isLive ? (
              <div className="ev3d-live-tag">
                <div className="ev3d-live-dot" />
                LIVE NOW
              </div>
            ) : (
              <span className="bdg bup" style={{ fontSize: ".56rem" }}>
                {ev.status || "Reg. Open"}
              </span>
            )}
          </div>
          <div className="ev3d-prize-badge">{ev.prize || "—"}</div>
        </div>

        <div className="ev3d-body">
          <div className="ev3d-title">{ev.name}</div>
          <div className="ev3d-meta">
            <div className="ev3d-mi">📅 {ev.date}</div>
            <div className="ev3d-mi">👥 {ev.players}</div>
            <div className="ev3d-mi">📍 {ev.location}</div>
          </div>
        </div>

        <div className="ev3d-footer">
          <div style={{ fontFamily: "var(--fh)", fontSize: ".75rem", color: "rgba(200,180,140,.5)" }}>
            {ev.location}
          </div>
          <Link className="ev3d-cta" href={href}>
            {isLive ? "Watch Live →" : "Register →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
