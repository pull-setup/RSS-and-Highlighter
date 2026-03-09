"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StickyHeader } from "@/app/components/StickyHeader";
import { ArticleFilterCheckboxes } from "@/app/components/ArticleFilterCheckboxes";
import { ChevronRightIcon } from "@/app/components/ArticleIcons";
import { LoadingWithLogo } from "@/app/components/LoadingWithLogo";
import { EmptyState } from "@/app/components/EmptyState";

type LatestArticle = {
  id: number;
  feed_id: number;
  title: string;
  url: string;
  author: string | null;
  published_at: string | null;
  is_read: boolean;
  is_bookmarked: boolean;
  thumbnail?: string | null;
};

export function HomeSections() {
  const [articles, setArticles] = useState<LatestArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    setArticles([]);
    const ctrl = new AbortController();
    const params = new URLSearchParams({ limit: "12" });
    if (bookmarkedOnly) params.set("bookmarkedOnly", "true");
    if (readOnly) params.set("readOnly", "true");
    fetch(`/api/articles/latest?${params}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!ctrl.signal.aborted) setArticles(data);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setArticles([]);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [bookmarkedOnly, readOnly]);

  return (
    <div className="flex min-h-[80vh] flex-col gap-3">
      {/* 1st half: RSS – latest 12 articles */}
      <div className="flex flex-col gap-2 min-h-[40vh]">
        <StickyHeader className="flex flex-wrap items-center justify-between gap-1.5">
          <h2 className="text-base font-semibold sm:text-lg md:text-xl">Articles</h2>
          <div className="flex items-center gap-1.5">
            <ArticleFilterCheckboxes
              bookmarkedOnly={bookmarkedOnly}
              readOnly={readOnly}
              onBookmarkedOnlyChange={setBookmarkedOnly}
              onReadOnlyChange={setReadOnly}
            />
            <Link
              href="/feeds/articles"
              className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
              aria-label="All articles"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </StickyHeader>
        {loading ? (
          <LoadingWithLogo />
        ) : articles.length === 0 ? (
          bookmarkedOnly || readOnly ? (
            <EmptyState message="No articles match your filters." />
          ) : (
            <EmptyState
              message="No articles yet."
              action={{ label: "Add a feed", href: "/feeds/new" }}
            />
          )
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {articles.map((article) => (
              <li
                key={`${article.feed_id}-${article.id}`}
                className={`list-item-hover flex flex-col overflow-hidden rounded-xl border ${
                  article.is_read
                    ? "border-border bg-surface"
                    : "border-border"
                }`}
              >
                <Link
                  href={`/feeds/${article.feed_id}/article/${article.id}?returnTo=/`}
                  className="flex min-h-0 flex-1 flex-row gap-1.5 p-2.5 sm:gap-2 sm:p-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-snug text-foreground line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted">
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
        )}
      </div>

      <div className="my-3 border-t border-border" role="separator" />

      {/* 2nd half: Highlights – placeholder */}
      <div className="flex flex-col gap-2 min-h-[40vh]">
        <StickyHeader className="flex flex-wrap items-center justify-between gap-1.5">
          <h2 className="text-base font-semibold sm:text-lg md:text-xl">Highlights</h2>
          <Link
            href="/highlights"
            className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="All highlights"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </StickyHeader>
        <EmptyState
          message="Highlights will appear here."
          action={{ label: "Go to Highlights", href: "/highlights" }}
          className="flex-1"
        />
      </div>
    </div>
  );
}
