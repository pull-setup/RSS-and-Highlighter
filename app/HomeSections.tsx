"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StickyHeader } from "@/app/components/StickyHeader";
import { ArticleFilterCheckboxes } from "@/app/components/ArticleFilterCheckboxes";
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
    <div className="flex min-h-[80vh] flex-col gap-6">
      {/* 1st half: RSS – latest 12 articles */}
      <div className="flex flex-col gap-4 min-h-[40vh]">
        <StickyHeader className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Articles</h2>
          <div className="flex items-center gap-3">
            <ArticleFilterCheckboxes
              bookmarkedOnly={bookmarkedOnly}
              readOnly={readOnly}
              onBookmarkedOnlyChange={setBookmarkedOnly}
              onReadOnlyChange={setReadOnly}
            />
            <Link
              href="/rss/articles"
              className="text-sm text-muted hover:text-foreground hover:underline"
            >
              All articles →
            </Link>
          </div>
        </StickyHeader>
        {loading ? (
          <ArticleSkeletonGrid count={12} />
        ) : articles.length === 0 ? (
          <p className="text-foreground/60 text-sm">
            No articles yet.{" "}
            <Link href="/rss/new" className="text-muted underline underline-offset-4 hover:text-foreground">
              Add a feed
            </Link>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {articles.map((article) => (
              <li
                key={`${article.feed_id}-${article.id}`}
                className={`flex flex-col overflow-hidden rounded-xl border ${
                  article.is_read
                    ? "border-border bg-surface"
                    : "border-border"
                }`}
              >
                <Link
                  href={`/rss/feeds/${article.feed_id}/article/${article.id}?returnTo=/`}
                  className="flex min-h-0 flex-1 flex-row gap-1.5 p-1.5 sm:gap-2 sm:p-2"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-snug text-foreground sm:text-base line-clamp-2">
                      {article.title}
                    </h3>
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
        )}
      </div>

      <div className="my-8 border-t border-border" role="separator" />

      {/* 2nd half: Highlights – placeholder */}
      <div className="flex flex-col gap-4 min-h-[40vh]">
        <StickyHeader className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Highlights</h2>
          <Link
            href="/highlights"
            className="text-sm text-muted hover:text-foreground hover:underline"
          >
            All highlights →
          </Link>
        </StickyHeader>
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-border border-dashed bg-surface py-12">
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
