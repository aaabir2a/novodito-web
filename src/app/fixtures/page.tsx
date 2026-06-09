import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Fixtures",
  description: "Upcoming match schedule across all active tournaments.",
};

export default function Page() {
  return (
    <PageStub icon="📅" title="Fixtures" blurb="Upcoming match schedule across all active tournaments." />
  );
}
