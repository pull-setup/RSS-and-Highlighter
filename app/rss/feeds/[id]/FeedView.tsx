"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MAX_ARTICLES_PER_FEED } from "@/lib/feeds";

const PAGE_SIZE = 12;

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
  const [total, setTotal] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback((offset: number, append: boolean) => {
    const limit = PAGE_SIZE;
    return fetch(`/api/feeds/${feedId}/articles?limit=${limit}&offset=${offset}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || `Failed (${r.status})`);
        }
        return r.json() as Promise<{ articles: Article[]; total: number }>;
      })
      .then(({ articles: data, total: feedTotal }) => {
        setTotal(feedTotal);
        const nextTotal = append ? articles.length + data.length : data.length;
        setArticles((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === limit && nextTotal < MAX_ARTICLES_PER_FEED);
      })
      .catch((err: Error) => setError(err.message || "Failed to load articles"))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      });
  }, [feedId]);

  useEffect(() => {
    load(0, false);
  }, [load]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");
    await load(articles.length, true);
  }

  async function refresh() {
    setRefreshing(true);
    setError("");
    try {
      await fetch(`/api/feeds/${feedId}`, { method: "PATCH" });
      await load(0, false);
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

  const searchLower = search.trim().toLowerCase();
  const filteredArticles = searchLower
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          (a.content != null && a.content.toLowerCase().includes(searchLower)) ||
          (a.excerpt != null && a.excerpt.toLowerCase().includes(searchLower))
      )
    : articles;

  if (loading) return <p className="text-foreground/70">Loading…</p>;
  if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex min-h-[44px] items-center justify-between gap-2 sm:min-h-0">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              href="/rss"
              className="shrink-0 text-sm text-foreground/70 hover:text-foreground hover:underline"
            >
              ← Feeds
            </Link>
            <h1 className="truncate text-xl font-semibold sm:text-2xl">{feedTitle}</h1>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-black/[.06] hover:text-foreground disabled:opacity-50 dark:hover:bg-white/[.08]"
            aria-label={refreshing ? "Refreshing feed" : "Refresh feed"}
          >
            <svg
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
        <label className="sr-only" htmlFor="feed-articles-search">
          Search articles
        </label>
        <input
          id="feed-articles-search"
          type="search"
          placeholder="Search articles by title or content…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/50 dark:border-white/10"
        />
      {articles.length === 0 ? (
        <p className="text-foreground/70">No articles. Try refreshing.</p>
      ) : filteredArticles.length === 0 ? (
        <p className="text-foreground/60 text-sm">No articles match your search.</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {filteredArticles.map((article) => (
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
          {!search.trim() && filteredArticles.length > 0 && (
            <p className="text-center text-sm text-foreground/60 pt-1">
              Showing 1–{filteredArticles.length} of {total ?? MAX_ARTICLES_PER_FEED}
            </p>
          )}
          {hasMore && !search.trim() && (
            <div className="flex justify-center pt-2 pb-1">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="min-h-[44px] rounded border border-black/10 dark:border-white/10 px-6 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06] disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
