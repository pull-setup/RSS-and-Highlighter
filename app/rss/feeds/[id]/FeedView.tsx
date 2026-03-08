"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Article = {
  id: number;
  guid: string;
  url: string;
  title: string;
  content: string | null;
  author: string | null;
  published_at: string | null;
  is_read: boolean;
  created_at: string;
  thumbnail?: string | null;
  excerpt?: string | null;
};

export function FeedView({
  feedId,
  feedTitle,
}: {
  feedId: string;
  feedTitle: string;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    return fetch(`/api/feeds/${feedId}/articles`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || `Failed (${r.status})`);
        }
        return r.json();
      })
      .then(setArticles)
      .catch((err: Error) => setError(err.message || "Failed to load articles"))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [feedId]);

  useEffect(() => {
    load();
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    setError("");
    try {
      await fetch(`/api/feeds/${feedId}`, { method: "PATCH" });
      await load();
    } catch {
      setError("Failed to refresh");
      setRefreshing(false);
    }
  }

  async function toggleRead(article: Article) {
    const next = !article.is_read;
    const res = await fetch(`/api/articles/${article.id}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: next }),
    });
    if (res.ok) {
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, is_read: next } : a))
      );
    }
  }

  if (loading) return <p className="text-foreground/70">Loading…</p>;
  if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="text-sm text-foreground/70 hover:underline disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh feed"}
        </button>
      </div>
      {articles.length === 0 ? (
        <p className="text-foreground/70">No articles. Try refreshing.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {articles.map((article) => (
            <li
              key={article.id}
              className={`flex flex-col overflow-hidden rounded-xl border ${
                article.is_read
                  ? "border-black/5 dark:border-white/5 bg-black/[.01] dark:bg-white/[.02]"
                  : "border-black/10 dark:border-white/10"
              }`}
            >
              <Link
                href={`/rss/feeds/${feedId}/article/${article.id}`}
                className="flex min-h-0 flex-1 flex-row gap-3 p-3 sm:gap-4 sm:p-4"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold leading-snug text-foreground sm:text-lg">
                    {article.title}
                  </h2>
                  <p className="mt-1.5 text-xs uppercase tracking-wide text-foreground/60 sm:mt-2">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).toUpperCase()
                      : ""}
                    {article.author ? ` • ${article.author.toUpperCase()}` : ""}
                  </p>
                </div>
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 sm:h-24 sm:w-24">
                  {article.thumbnail ? (
                    <img
                      src={article.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-foreground/30 text-xs">
                      No image
                    </div>
                  )}
                </div>
              </Link>
              <div className="border-t border-black/5 dark:border-white/5 px-3 py-2 sm:px-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleRead(article);
                  }}
                  className="min-h-[44px] min-w-[44px] text-sm text-foreground/70 hover:underline active:opacity-80 sm:min-h-0 sm:min-w-0"
                >
                  {article.is_read ? "Mark unread" : "Mark read"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
