import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Admin",
  description: "Administrator access to the Nobodito management console.",
};

export default function Page() {
  return (
    <PageStub icon="🔐" title="Admin" blurb="Administrator access to the Nobodito management console." />
  );
}
