import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Official Store",
  description: "Jerseys, merch, and collectibles from Bangladesh's #1 eFootball platform.",
};

export default function Page() {
  return (
    <PageStub icon="🛒" title="Official Store" blurb="Jerseys, merch, and collectibles from Bangladesh's #1 eFootball platform." />
  );
}
