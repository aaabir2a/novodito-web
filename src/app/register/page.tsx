import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Player Registration",
  description: "Join the 2026 season. ৳600 entry fee. All skill levels welcome.",
};

export default function Page() {
  return (
    <PageStub icon="📝" title="Player Registration" blurb="Join the 2026 season. ৳600 entry fee. All skill levels welcome." />
  );
}
