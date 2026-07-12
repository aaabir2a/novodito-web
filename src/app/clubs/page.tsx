import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Clubs",
  description: "Registered clubs, rosters, and standings across the eBattleVerse league.",
};

export default function Page() {
  return (
    <PageStub icon="🛡️" title="Clubs" blurb="Registered clubs, rosters, and standings across the eBattleVerse league." />
  );
}
