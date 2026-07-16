import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Community",
  description: "Country-based eBattleVerse communities — top players, active clubs, and cross-country battles.",
};

export default function Page() {
  return (
    <PageStub
      icon="🌍"
      title="Community"
      blurb="Country pages with top players, active clubs, and cross-country challenge battles."
    />
  );
}
