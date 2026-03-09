"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StickyHeader } from "@/app/components/StickyHeader";
import { ArticleFilterCheckboxes } from "@/app/components/ArticleFilterCheckboxes";
import { ArticleSkeletonGrid } from "@/app/components/ArticleSkeleton";
import { LoadingWithLogo } from "@/app/components/LoadingWithLogo";
import { EmptyState } from "@/app/components/EmptyState";
import { HighlightText } from "@/app/components/HighlightText";
import { ChevronLeftIcon } from "@/app/components/ArticleIcons";
import { MAX_ARTICLES_PER_FEED } from "@/lib/feeds";

const PAGE_SIZE = 36;

type Article = {
  id: number;
  guid: string;
  url: string;
  title: string;
  content: string | null;
  author: string | null;
  published_at: string | null;
  is_read: boolean;
  is_bookmarked: boolean;
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
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback((offset: number, append: boolean, signal?: AbortSignal) => {
    if (!append) {
      setLoading(true);
      setArticles([]);
    }
    const limit = PAGE_SIZE;
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (bookmarkedOnly) params.set("bookmarkedOnly", "true");
    if (readOnly) params.set("readOnly", "true");
    return fetch(`/api/feeds/${feedId}/articles?${params}`, { signal })
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || `Failed (${r.status})`);
        }
        return r.json() as Promise<{ articles: Article[]; total: number }>;
      })
      .then(({ articles: data, total: feedTotal }) => {
        if (signal?.aborted) return;
        setTotal(feedTotal);
        setArticles((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === limit && offset + data.length < Math.min(feedTotal, MAX_ARTICLES_PER_FEED));
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load articles");
      })
      .finally(() => {
        if (signal?.aborted) return;
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      });
  }, [feedId, bookmarkedOnly, readOnly]);

  useEffect(() => {
    const ctrl = new AbortController();
    load(0, false, ctrl.signal);
    return () => ctrl.abort();
  }, [load, refreshKey]);

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
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Failed to refresh");
      setRefreshing(false);
    }
  }

  const searchLower = search.trim().toLowerCase();
  const effectiveSearch = searchLower.length >= 2 ? searchLower : "";
  const matchInContent = (a: Article) =>
    effectiveSearch &&
    !a.title.toLowerCase().includes(effectiveSearch) &&
    ((a.content != null && a.content.toLowerCase().includes(effectiveSearch)) ||
      (a.excerpt != null && a.excerpt.toLowerCase().includes(effectiveSearch)));
  const filteredArticles = articles.filter(
    (a) =>
      !effectiveSearch ||
      a.title.toLowerCase().includes(effectiveSearch) ||
      (a.content != null && a.content.toLowerCase().includes(effectiveSearch)) ||
      (a.excerpt != null && a.excerpt.toLowerCase().includes(effectiveSearch))
  );

  if (error) return <p className="text-error">{error}</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <StickyHeader className="flex flex-col gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/feeds"
              className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
              aria-label="Back to Feeds"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
            <h1 className="truncate text-base font-semibold sm:text-lg md:text-xl text-center md:text-left shrink-0">{feedTitle}</h1>
            <label className="sr-only" htmlFor="feed-articles-search">
              Search articles
            </label>
            <div className="relative flex-1 min-w-0 w-full max-w-[480px] sm:max-w-[600px] md:max-w-[720px]">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                id="feed-articles-search"
                type="search"
                placeholder="Search articles…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted min-h-[40px]"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <ArticleFilterCheckboxes
                bookmarkedOnly={bookmarkedOnly}
                readOnly={readOnly}
                onBookmarkedOnlyChange={setBookmarkedOnly}
                onReadOnlyChange={setReadOnly}
              />
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-full p-1 text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
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
                    strokeWidth={2.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </StickyHeader>
        {loading ? (
          <LoadingWithLogo />
        ) : articles.length === 0 ? (
          bookmarkedOnly || readOnly ? (
            <EmptyState message="No articles match your filters." />
          ) : (
            <EmptyState message="No articles. Try refreshing the feed." />
          )
        ) : filteredArticles.length === 0 ? (
          <EmptyState message="No articles match your search or filters." />
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {filteredArticles.map((article) => (
                <li
                  key={article.id}
                  className={`list-item-hover flex flex-col overflow-hidden rounded-xl border ${
                    matchInContent(article)
                      ? "border-2 border-amber-500 dark:border-amber-400 bg-amber-50/40 dark:bg-amber-950/30"
                      : article.is_read
                        ? "border-border bg-surface"
                        : "border-border"
                  }`}
                >
                  <Link
                    href={`/feeds/${feedId}/article/${article.id}?returnTo=/feeds/${feedId}`}
                    className="flex min-h-0 flex-1 flex-row gap-1.5 p-2.5 sm:gap-2 sm:p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-bold leading-snug text-foreground sm:text-base">
                        <HighlightText text={article.title} search={effectiveSearch} />
                      </h2>
                      <p className="mt-1.5 text-xs uppercase tracking-wide text-muted sm:mt-2">
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
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface sm:h-20 sm:w-20">
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
                </li>
              ))}
            </ul>
            {filteredArticles.length > 0 && (
              <p className="text-center text-sm text-muted pt-1">
                Showing 1–{filteredArticles.length} of {total ?? MAX_ARTICLES_PER_FEED}
              </p>
            )}
            {loadingMore && (
              <div className="pt-2 pb-1">
                <ArticleSkeletonGrid count={4} />
              </div>
            )}
            {hasMore && !effectiveSearch && !loadingMore && (
              <div className="flex justify-center pt-2 pb-1">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="min-h-[40px] min-w-[40px] rounded border border-border px-5 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-surface disabled:opacity-50 touch-manipulation"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
