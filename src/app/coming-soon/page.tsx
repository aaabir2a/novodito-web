import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "New game titles joining the eBattleVerse multi-game roster.",
};

export default function Page() {
  return (
    <PageStub
      icon="🚀"
      title="Coming Soon"
      blurb="New game titles joining the eBattleVerse roster. Get notified when your game goes live."
    />
  );
}
