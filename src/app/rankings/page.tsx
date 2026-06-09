import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Rankings",
  description: "National leaderboard updated weekly. Track top players across the 2026 season.",
};

export default function Page() {
  return (
    <PageStub icon="📊" title="Rankings" blurb="National leaderboard updated weekly. Track top players across the 2026 season." />
  );
}
