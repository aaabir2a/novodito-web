import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Sponsorship",
  description: "Partner with Bangladesh's premier eFootball tournament organizer.",
};

export default function Page() {
  return (
    <PageStub icon="🤝" title="Sponsorship" blurb="Partner with Bangladesh's premier eFootball tournament organizer." />
  );
}
