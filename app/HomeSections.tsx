"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LatestArticle = {
  id: number;
  feed_id: number;
  title: string;
  url: string;
  author: string | null;
  published_at: string | null;
  is_read: boolean;
  thumbnail?: string | null;
};

export function HomeSections() {
  const [articles, setArticles] = useState<LatestArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles/latest?limit=8")
      .then((r) => (r.ok ? r.json() : []))
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-[80vh] flex-col gap-6">
      {/* 1st half: RSS – latest 8 articles */}
      <div className="flex flex-col gap-4 min-h-[40vh]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">RSS</h2>
          <Link
            href="/rss"
            className="text-sm text-foreground/70 hover:text-foreground hover:underline"
          >
            All feeds →
          </Link>
        </div>
        {loading ? (
          <p className="text-foreground/60 text-sm">Loading…</p>
        ) : articles.length === 0 ? (
          <p className="text-foreground/60 text-sm">
            No articles yet.{" "}
            <Link href="/rss/new" className="underline underline-offset-4">
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
                    ? "border-black/5 dark:border-white/5 bg-black/[.01] dark:bg-white/[.02]"
                    : "border-black/10 dark:border-white/10"
                }`}
              >
                <Link
                  href={`/rss/feeds/${article.feed_id}/article/${article.id}`}
                  className="flex min-h-0 flex-1 flex-row gap-3 p-3 sm:gap-4 sm:p-4"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold leading-snug text-foreground sm:text-lg line-clamp-2">
                      {article.title}
                    </h3>
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
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 2nd half: Kindle Highlights – placeholder */}
      <div className="flex flex-col gap-4 min-h-[40vh]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Kindle Highlights</h2>
          <Link
            href="/highlights"
            className="text-sm text-foreground/70 hover:text-foreground hover:underline"
          >
            All highlights →
          </Link>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-black/10 border-dashed bg-black/[.02] dark:border-white/10 dark:bg-white/[.02] py-12">
          <p className="text-foreground/60 text-sm">Highlights will appear here.</p>
          <Link
            href="/highlights"
            className="mt-2 text-sm text-foreground/70 underline underline-offset-4 hover:text-foreground"
          >
            Go to Highlights
          </Link>
        </div>
      </div>
    </div>
  );
}
