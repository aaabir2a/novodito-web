"use client";

// Realtime primitives (UX_UI_PLAN §2 + §5 "realtime honesty").
// LiveDot, CountUp, Skeleton, ReconnectBanner — every live surface uses these,
// so connection/change states look identical platform-wide.

import { useEffect, useRef, useState } from "react";

export function LiveDot() {
  return <span className="eb-livedot" aria-label="live" />;
}

/** Animates toward `value` on change. Compositor-cheap: only text mutation. */
export function CountUp({
  value,
  duration = 600,
  format = (n: number) => Math.round(n).toLocaleString(),
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
      setShown(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{format(shown)}</span>;
}

/** Shimmer placeholder block. Give it width/height via style or className. */
export function Skeleton({
  style,
  className,
}: {
  style?: React.CSSProperties;
  className?: string;
}) {
  return <span aria-hidden className={`eb-skel ${className ?? ""}`} style={{ display: "inline-block", ...style }} />;
}

/** Fixed banner shown while a live connection is down. Render conditionally. */
export function ReconnectBanner({ label = "Connection lost — reconnecting…" }: { label?: string }) {
  return (
    <div className="eb-reconnect" role="status">
      <span className="eb-livedot" aria-hidden />
      {label}
    </div>
  );
}

/** Standard empty state (§ P8: every list needs one). */
export function EmptyState({
  icon = "🛰️",
  title,
  desc,
  action,
}: {
  icon?: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="eb-empty">
      <span className="ic" aria-hidden>{icon}</span>
      <span className="tt">{title}</span>
      {desc ? <span className="ds">{desc}</span> : null}
      {action}
    </div>
  );
}
