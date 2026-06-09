import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Tournaments",
  description: "All 2026 eFootball tournaments with brackets, schedules, and live status.",
};

export default function Page() {
  return (
    <PageStub icon="🏆" title="Tournaments" blurb="All 2026 eFootball tournaments with brackets, schedules, and live status." />
  );
}
