import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "News",
  description: "Tournament announcements, player updates, and official partner news.",
};

export default function Page() {
  return (
    <PageStub icon="📰" title="News" blurb="Tournament announcements, player updates, and official partner news." />
  );
}
