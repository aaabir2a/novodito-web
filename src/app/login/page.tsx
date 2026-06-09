import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: "Player Login",
  description: "Sign in to your player portal to manage registrations and stats.",
};

export default function Page() {
  return (
    <PageStub icon="👤" title="Player Login" blurb="Sign in to your player portal to manage registrations and stats." />
  );
}
