import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and highlights from tournaments, finals, and community events.",
};

export default function Page() {
  return (
    <PageStub icon="📸" title="Gallery" blurb="Photos and highlights from tournaments, finals, and community events." />
  );
}
