"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StickyHeader } from "@/app/components/StickyHeader";
import { ArticleFilterCheckboxes } from "@/app/components/ArticleFilterCheckboxes";
import { ArticleSkeletonGrid } from "@/app/components/ArticleSkeleton";
import { HighlightText } from "@/app/components/HighlightText";

const PAGE_SIZE = 36;

type Article = {
  id: number;
  feed_id: number;
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

export function AllArticlesView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback((offset: number, append: boolean) => {
    if (!append) setLoading(true);
    const limit = PAGE_SIZE;
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (bookmarkedOnly) params.set("bookmarkedOnly", "true");
    if (readOnly) params.set("readOnly", "true");
    return fetch(`/api/articles?${params}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || `Failed (${r.status})`);
        }
        return r.json() as Promise<{ articles: Article[]; total: number }>;
      })
      .then(({ articles: data, total: allTotal }) => {
        setTotal(allTotal);
        setArticles((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === limit && offset + data.length < allTotal);
      })
      .catch((err: Error) => setError(err.message || "Failed to load articles"))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [bookmarkedOnly, readOnly]);

  useEffect(() => {
    load(0, false);
  }, [load]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");
    await load(articles.length, true);
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <StickyHeader className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:min-h-[44px]">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="shrink-0 font-bold text-muted hover:text-foreground min-h-[44px] flex items-center py-1"
              aria-label="Back to Home"
            >
              ←
            </Link>
            <h1 className="truncate text-lg font-semibold sm:text-xl md:text-2xl">All articles</h1>
          </div>
          <div className="relative flex-1 min-w-0 max-w-[400px] sm:max-w-[500px]">
            <label className="sr-only" htmlFor="all-articles-search">
              Search articles
            </label>
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
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              id="all-articles-search"
              type="search"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-transparent py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted min-h-[44px]"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ArticleFilterCheckboxes
              bookmarkedOnly={bookmarkedOnly}
              readOnly={readOnly}
              onBookmarkedOnlyChange={setBookmarkedOnly}
              onReadOnlyChange={setReadOnly}
            />
          </div>
        </StickyHeader>
        {loading ? (
          <ArticleSkeletonGrid count={PAGE_SIZE} />
        ) : articles.length === 0 ? (
          <p className="text-foreground/70">No articles yet. Add feeds to get started.</p>
        ) : filteredArticles.length === 0 ? (
          <p className="text-foreground/60 text-sm">No articles match your search.</p>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              {filteredArticles.map((article) => (
                <li
                  key={`${article.feed_id}-${article.id}`}
                  className={`flex flex-col overflow-hidden rounded-xl border ${
                    matchInContent(article)
                      ? "border-2 border-amber-500 dark:border-amber-400 bg-amber-50/40 dark:bg-amber-950/30"
                      : article.is_read
                        ? "border-border bg-surface"
                        : "border-border"
                  }`}
                >
                  <Link
                    href={`/rss/feeds/${article.feed_id}/article/${article.id}?returnTo=/rss/articles`}
                    className="flex min-h-0 flex-1 flex-row gap-1.5 p-1.5 sm:gap-2 sm:p-2"
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
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface sm:h-24 sm:w-24">
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
                Showing 1–{filteredArticles.length} of {total ?? 0}
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
                  className="min-h-[44px] min-w-[44px] rounded border border-border px-6 py-3 sm:py-2.5 text-sm text-foreground/70 transition-colors hover:bg-surface disabled:opacity-50 touch-manipulation"
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
