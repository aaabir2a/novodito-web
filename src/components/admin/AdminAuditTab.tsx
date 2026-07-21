"use client";

// Immutable audit trail (FR-157) — every admin action, newest first.

import { useEffect, useState } from "react";
import { getAuditLog, type AuditLogRow } from "@/lib/api";
import { EmptyState, Skeleton } from "@/components/system/Realtime";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function AdminAuditTab() {
  const [rows, setRows] = useState<AuditLogRow[] | null>(null);

  useEffect(() => {
    getAuditLog().then((d) => setRows(d.logs)).catch(() => setRows([]));
  }, []);

  if (rows === null) return <Skeleton style={{ width: "100%", height: 120 }} />;
  if (rows.length === 0) {
    return <EmptyState icon="📜" title="No audit entries yet" desc="Every ban, approval, and role change is recorded here." />;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="eb-pf-table">
        <thead>
          <tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th><th>Note</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ fontSize: ".72rem", whiteSpace: "nowrap" }}>{fmt(r.created_at)}</td>
              <td>{r.admin_username}</td>
              <td style={{ fontFamily: "var(--fo)", fontSize: ".7rem", color: "var(--gold)" }}>{r.action_type}</td>
              <td style={{ fontSize: ".72rem" }}>{r.target_entity}{r.target_id ? ` · ${r.target_id.slice(0, 8)}` : ""}</td>
              <td style={{ fontSize: ".72rem", color: "rgba(190,205,195,.7)" }}>{r.note ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
