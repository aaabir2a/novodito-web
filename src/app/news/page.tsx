// Phase 6 — News portal (FR-005): platform articles + announcements.
// Server Component against /social/news/.

import type { Metadata } from "next";
import Link from "next/link";
import { getNews, type NewsArticle } from "@/lib/api";
import { EmptyState } from "@/components/system/Realtime";

export const metadata: Metadata = {
  title: "News",
  description: "Tournament announcements, player updates, and official partner news.",
};
export const revalidate = 120;

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function NewsPage() {
  const raw = await getNews().catch(() => [] as NewsArticle[]);
  const articles: NewsArticle[] = Array.isArray(raw) ? raw : raw.articles ?? [];
  const sorted = [...articles].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));

  return (
    <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 className="ht" style={{ fontSize: "2.2rem", marginBottom: "1.2rem" }}>
          <span className="go">NEWS</span>
        </h1>

        {sorted.length === 0 ? (
          <EmptyState
            icon="📰"
            title="No articles published yet"
            desc="Tournament announcements, transfer talk, and season recaps will publish here."
            action={<Link className="btn btn-gh btn-sm" href="/tournaments">Browse tournaments →</Link>}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {sorted.map((a) => (
              <article key={a.id} className="eb-pf-card">
                <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".5rem" }}>
                  {a.is_pinned ? <span className="eb-status pending" style={{ flexShrink: 0 }}>📌 Pinned</span> : null}
                  <h2 style={{ fontFamily: "var(--fh)", fontSize: "1.35rem", letterSpacing: ".04em", color: "#fff" }}>
                    {a.title}
                  </h2>
                </div>
                <p style={{ fontSize: ".85rem", color: "rgba(200,215,205,.85)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                  {a.body.length > 400 ? `${a.body.slice(0, 400)}…` : a.body}
                </p>
                <div style={{ marginTop: ".7rem", fontFamily: "var(--fo)", fontSize: ".55rem", letterSpacing: ".1em", color: "rgba(170,190,180,.55)", textTransform: "uppercase" }}>
                  {a.author_username ? `${a.author_username} · ` : ""}
                  {a.published_at ? fmt(a.published_at) : fmt(a.created_at)}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
