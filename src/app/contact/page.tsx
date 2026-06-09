import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Nobodito Gaming team.",
};

export default function Page() {
  return (
    <PageStub icon="📞" title="Contact" blurb="Get in touch with the Nobodito Gaming team." />
  );
}
