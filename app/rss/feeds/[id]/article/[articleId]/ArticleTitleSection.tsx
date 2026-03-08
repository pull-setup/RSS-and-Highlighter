"use client";

import { ArticleTextZoom } from "./ArticleTextZoom";

export function ArticleTitleSection({
  title,
  publishedAt,
  author,
  readingTimeMinutes,
}: {
  title: string;
  publishedAt: string | null;
  author: string | null;
  readingTimeMinutes: number | null;
}) {
  const dateStr =
    publishedAt != null
      ? new Date(publishedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).toUpperCase()
      : "";
  const metaStr = [dateStr, author ? author.toUpperCase() : ""].filter(Boolean).join(" • ");

  return (
    <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3 mb-6 border-b border-white/10 transition-[box-shadow,border-color] duration-200 bg-black/60 dark:bg-black/60 backdrop-blur-md [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))] [padding-top:max(0.75rem,env(safe-area-inset-top))]">
      <div className="min-w-0">
        <ArticleTextZoom>
          <header>
            <h1 className="text-base font-bold leading-tight text-white sm:text-xl md:text-2xl">
              {title}
            </h1>
            <div className="mt-0.5 sm:mt-1 flex items-center justify-between gap-2 min-w-0">
              {metaStr ? (
                <p className="text-xs uppercase tracking-wide text-white/80 truncate sm:text-sm">
                  {metaStr}
                </p>
              ) : (
                <span />
              )}
              {readingTimeMinutes != null && readingTimeMinutes > 0 ? (
                <span className="text-xs uppercase tracking-wide text-white/80 shrink-0 sm:text-sm">
                  {readingTimeMinutes} min read
                </span>
              ) : null}
            </div>
          </header>
        </ArticleTextZoom>
      </div>
    </div>
  );
}
