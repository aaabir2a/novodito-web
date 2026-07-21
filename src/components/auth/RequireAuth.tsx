"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Client-side route guard. While the auth bootstrap runs it shows a light
 * placeholder; once resolved, unauthenticated users are bounced to /login with
 * a `next` param so they return here after signing in.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div
        className="page act"
        style={{
          paddingLeft: "1.25rem",
          paddingRight: "1.25rem",
          paddingBottom: "5rem",
          textAlign: "center",
          color: "rgba(220,210,240,.7)",
        }}
      >
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
