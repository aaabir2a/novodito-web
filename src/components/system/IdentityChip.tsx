// The atomic identity unit (FR-049: photo on EVERY player row).
// Used in leaderboard rows, match cards, chat, feeds, brackets.

export type ChipSize = "sm" | "md" | "lg";

export interface IdentityChipProps {
  name: string;
  avatarUrl?: string | null;
  /** Ladder position — renders as gold "#N". */
  rank?: number | null;
  platform?: "mobile" | "console" | null;
  clubName?: string | null;
  verified?: boolean;
  /** Elite ranking range → gold glow border (FR-024). */
  elite?: boolean;
  size?: ChipSize;
}

const PLATFORM_ICON = { mobile: "📱", console: "🎮" } as const;

export default function IdentityChip({
  name,
  avatarUrl,
  rank,
  platform,
  clubName,
  verified,
  elite,
  size = "md",
}: IdentityChipProps) {
  const hasSub = rank != null || platform || clubName;
  return (
    <span className={`eb-chip ${size}${elite ? " elite" : ""}`}>
      <span className="eb-chip-av" aria-hidden={!!avatarUrl}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" loading="lazy" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </span>
      <span className="eb-chip-body">
        <span className="eb-chip-name">
          {name}
          {verified ? (
            <span className="vfd" title="Verified player">✔</span>
          ) : null}
        </span>
        {hasSub ? (
          <span className="eb-chip-sub">
            {rank != null ? <span className="eb-chip-rank">#{rank}</span> : null}
            {platform ? <span title={platform}>{PLATFORM_ICON[platform]}</span> : null}
            {clubName ? <span>{clubName}</span> : null}
          </span>
        ) : null}
      </span>
    </span>
  );
}
