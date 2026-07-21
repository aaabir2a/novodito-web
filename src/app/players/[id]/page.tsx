// Public player profile (UJ-007: guest can admire a player).
// Client component does the data fetching — profile is interactive (tabs, follow).

import type { Metadata } from "next";
import ProfileView from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "Player Profile",
  description: "Competitive record, form, and tactical profile of an eBattleVerse player.",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div
      className="page act"
      style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <ProfileView playerId={id} />
      </div>
    </div>
  );
}
