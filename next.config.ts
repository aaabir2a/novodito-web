import type { NextConfig } from "next";

// Backend origin the Next server proxies API calls to. Server-only (never sent
// to the browser). Browser code always calls the same-origin `/api/v1/*` path,
// which this rewrite forwards to Django — so the browser only ever speaks HTTPS
// to this app, avoiding mixed-content blocks, CORS, and cross-site cookies.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Django requires trailing slashes (APPEND_SLASH). Without this, Next 308s
  // `/api/v1/x/` -> `/api/v1/x` before the rewrite, and Django can't redirect a
  // POST body — so keep the URL verbatim and let the rewrite forward the slash.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        // Re-append the trailing slash Next strips during matching, so Django's
        // APPEND_SLASH routes receive `/api/v1/x/` (required for POST).
        source: "/api/v1/:path*",
        destination: `${BACKEND_ORIGIN}/api/v1/:path*/`,
      },
    ];
  },
};

export default nextConfig;
