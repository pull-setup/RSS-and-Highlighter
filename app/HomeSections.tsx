"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StickyHeader } from "@/app/components/StickyHeader";
import { ArticleFilterCheckboxes } from "@/app/components/ArticleFilterCheckboxes";
import { ChevronRightIcon } from "@/app/components/ArticleIcons";
import { ArticleSkeletonGrid } from "@/app/components/ArticleSkeleton";

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
    const params = new URLSearchParams({ limit: "12" });
    if (bookmarkedOnly) params.set("bookmarkedOnly", "true");
    if (readOnly) params.set("readOnly", "true");
    fetch(`/api/articles/latest?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setArticles)
      .finally(() => setLoading(false));
  }, [bookmarkedOnly, readOnly]);

  return (
    <div className="flex min-h-[80vh] flex-col gap-3">
      {/* 1st half: RSS – latest 12 articles */}
      <div className="flex flex-col gap-2 min-h-[40vh]">
        <StickyHeader className="flex flex-wrap items-center justify-between gap-1.5">
          <h2 className="text-lg font-semibold">Articles</h2>
          <div className="flex items-center gap-1.5">
            <ArticleFilterCheckboxes
              bookmarkedOnly={bookmarkedOnly}
              readOnly={readOnly}
              onBookmarkedOnlyChange={setBookmarkedOnly}
              onReadOnlyChange={setReadOnly}
            />
            <Link
              href="/feeds/articles"
              className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground sm:min-h-0 sm:min-w-0 sm:py-1"
              aria-label="All articles"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </StickyHeader>
        {loading ? (
          <ArticleSkeletonGrid count={12} />
        ) : articles.length === 0 ? (
          <p className="text-foreground/60 text-sm">
            No articles yet.{" "}
            <Link href="/feeds/new" className="text-muted underline underline-offset-4 hover:text-foreground">
              Add a feed
            </Link>
            .
          </p>
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
          <h2 className="text-lg font-semibold">Highlights</h2>
          <Link
            href="/highlights"
            className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground sm:min-h-0 sm:min-w-0 sm:py-1"
            aria-label="All highlights"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </StickyHeader>
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-border border-dashed bg-surface py-8">
          <p className="text-foreground/60 text-sm">Highlights will appear here.</p>
          <Link
            href="/highlights"
            className="mt-2 text-sm text-muted underline underline-offset-4 hover:text-foreground"
          >
            Go to Highlights
          </Link>
        </div>
      </div>
    </div>
  );
}
