// Single status vocabulary for the whole platform (UX_UI_PLAN §2).
// Every surface uses these exact words + colors — never ad-hoc labels.

export type StatusKind =
  | "live"
  | "verified"
  | "pending"
  | "conflict"
  | "win"
  | "loss"
  | "draw"
  | "neutral";

const DEFAULT_LABEL: Record<StatusKind, string> = {
  live: "Live",
  verified: "Verified",
  pending: "Pending",
  conflict: "Under review",
  win: "Win",
  loss: "Loss",
  draw: "Draw",
  neutral: "—",
};

export default function StatusBadge({
  kind,
  label,
}: {
  kind: StatusKind;
  label?: string;
}) {
  return (
    <span className={`eb-status ${kind}`}>
      {kind === "live" ? <span className="eb-livedot" aria-hidden /> : null}
      {label ?? DEFAULT_LABEL[kind]}
    </span>
  );
}
