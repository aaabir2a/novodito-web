import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Matches",
  description: "Match results, fixtures, and live scores from every Nobodito event.",
};

export default function Page() {
  return (
    <PageStub icon="⚽" title="Matches" blurb="Match results, fixtures, and live scores from every Nobodito event." />
  );
}
