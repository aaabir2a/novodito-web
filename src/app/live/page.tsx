import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Live",
  description: "Watch live eBattleVerse matches, player streams, and referee POV coverage.",
};

export default function Page() {
  return (
    <PageStub
      icon="📡"
      title="Live"
      blurb="Live match streams, player broadcasts, and referee POV coverage. Watch and earn Battle Coins."
    />
  );
}
