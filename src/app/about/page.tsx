import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "About Nobodito",
  description: "Official Konami eFootball partner building competitive gaming in Bangladesh.",
};

export default function Page() {
  return (
    <PageStub icon="ℹ️" title="About Nobodito" blurb="Official Konami eFootball partner building competitive gaming in Bangladesh." />
  );
}
