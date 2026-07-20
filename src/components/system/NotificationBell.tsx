"use client";

// Notification bell (REQ-59) — wired to /social/notifications/ (Phase 6).
// Unread badge, panel list with plain-language rendering per type, per-item
// mark-read on click, mark-all action. Polls every 60s while mounted.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from "@/lib/api";
import { EmptyState, Skeleton } from "@/components/system/Realtime";

const TYPE_TEXT: Record<string, (ctx: Record<string, unknown> | null) => string> = {
  match_reminder: (c) => `⏰ Match starts ${c?.minutes ? `in ${c.minutes} min` : "soon"}`,
  club_invite: (c) => `🛡️ ${c?.club_name ?? "A club"} invited you`,
  rank_change: (c) => `📈 Rank changed${c?.new_rank ? ` — now #${c.new_rank}` : ""}`,
  match_found: () => `⚔️ Matchmaking found you an opponent`,
  mention: (c) => `💬 ${c?.by ?? "Someone"} mentioned you`,
  follow: (c) => `➕ ${c?.by ?? "Someone"} followed you`,
  coin_earned: (c) => `🪙 Earned ${c?.amount ?? ""} coins`,
};

function renderText(n: ApiNotification): string {
  const fn = TYPE_TEXT[n.notification_type];
  if (fn) return fn(n.context);
  return `🔔 ${n.notification_type.replace(/_/g, " ")}`;
}

const fmtT = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ApiNotification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    getNotifications()
      .then((d) => {
        setItems(d.notifications);
        setUnread(d.unread_count);
      })
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 60000);
    return () => clearInterval(iv);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    refresh();
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
  }, [open, refresh]);

  const clickItem = async (n: ApiNotification) => {
    if (!n.read) {
      setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? null);
      setUnread((u) => Math.max(0, u - 1));
      try {
        await markNotificationRead(n.id);
      } catch {
        /* server refused — next poll re-syncs truth */
      }
    }
  };

  const readAll = async () => {
    setItems((prev) => prev?.map((x) => ({ ...x, read: true })) ?? null);
    setUnread(0);
    try {
      await markAllNotificationsRead();
    } catch {
      /* next poll re-syncs */
    }
  };

  return (
    <div style={{ position: "relative" }} ref={rootRef}>
      <button
        className="eb-bell"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      >
        🔔
        {unread > 0 ? <span className="eb-bell-badge">{unread > 99 ? "99+" : unread}</span> : null}
      </button>

      {open ? (
        <div className="eb-bell-panel" role="dialog" aria-label="Notifications">
          {items === null ? (
            <Skeleton style={{ width: "100%", height: 60 }} />
          ) : items.length === 0 ? (
            <EmptyState
              icon="🔕"
              title="No notifications yet"
              desc="Match reminders, club invites, and rank changes will land here."
            />
          ) : (
            <>
              <div className="eb-bell-head">
                <span>Notifications</span>
                {unread > 0 ? (
                  <button className="eb-filter-reset" onClick={readAll}>Mark all read</button>
                ) : null}
              </div>
              <ul className="eb-bell-list">
                {items.map((n) => (
                  <li key={n.id} className={n.read ? "read" : ""} onClick={() => clickItem(n)}>
                    <span className="tx">{renderText(n)}</span>
                    <time>{fmtT(n.created_at)}</time>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
