import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = { title: "Club Login", description: "Sign in to your club portal." };

export default function Page() {
  return <PageStub icon="🛡️" title="Club Login" blurb="Sign in to manage your club roster, fixtures, and tournament entries." />;
}
