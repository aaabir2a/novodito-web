import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "About eBattleVerse",
  description: "Official Konami eFootball partner building competitive gaming in Bangladesh.",
};

export default function Page() {
  return (
    <PageStub icon="ℹ️" title="About eBattleVerse" blurb="Official Konami eFootball partner building competitive gaming in Bangladesh." />
  );
}
