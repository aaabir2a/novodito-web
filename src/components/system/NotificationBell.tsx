"use client";

// Notification bell (REQ-59). Badge count + dropdown panel.
// Real notification feed + push permission flow land in Phase 6; the shell
// ships now so the navbar IA is final.

import { useEffect, useRef, useState } from "react";
import { EmptyState } from "./Realtime";

export default function NotificationBell({ count = 0 }: { count?: number }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div style={{ position: "relative" }} ref={rootRef}>
      <button
        className="eb-bell"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
      >
        🔔
        {count > 0 ? <span className="eb-bell-badge">{count > 99 ? "99+" : count}</span> : null}
      </button>

      {open ? (
        <div className="eb-bell-panel" role="dialog" aria-label="Notifications">
          <EmptyState
            icon="🔕"
            title="No notifications yet"
            desc="Match reminders, club invites, and rank changes will land here."
          />
        </div>
      ) : null}
    </div>
  );
}
