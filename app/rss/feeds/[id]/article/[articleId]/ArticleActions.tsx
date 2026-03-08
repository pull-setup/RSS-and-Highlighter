"use client";

import Link from "next/link";
import { useState } from "react";

export function ArticleActions({
  articleId,
  isRead,
  articleUrl,
  feedId,
  feedTitle,
  prevArticleHref = null,
  nextArticleHref = null,
}: {
  articleId: number;
  isRead: boolean;
  articleUrl: string;
  feedId: string;
  feedTitle: string;
  prevArticleHref?: string | null;
  nextArticleHref?: string | null;
}) {
  const [read, setRead] = useState(isRead);

  async function toggle() {
    const next = !read;
    const res = await fetch(`/api/articles/${articleId}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: next }),
    });
    if (res.ok) setRead(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Back + Original & Mark read - mobile: stack or wrap with touch targets */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Link
          href={`/rss/feeds/${feedId}`}
          className="flex min-h-[44px] min-w-0 items-center gap-1.5 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground sm:min-h-0 sm:py-0"
        >
          <span className="shrink-0 text-base leading-none">←</span>
          <span className="truncate">{feedTitle}</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded border border-black/10 px-3 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-black/[.04] dark:border-white/10 dark:hover:bg-white/[.06] sm:min-h-0 sm:min-w-0 sm:py-1.5"
          >
            Original ↗
          </a>
          <button
            type="button"
            onClick={toggle}
            className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded border px-3 py-2.5 text-sm transition-colors sm:min-h-0 sm:min-w-0 sm:py-1.5 ${
              read
                ? "border-black/10 text-foreground/50 hover:bg-black/[.04] dark:border-white/10 dark:hover:bg-white/[.06]"
                : "border-black/20 text-foreground hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
            }`}
          >
            {read ? "Mark unread" : "Mark read"}
          </button>
        </div>
      </div>
      {/* Row 2: Previous & Next - full-width tap targets on mobile */}
      {(prevArticleHref || nextArticleHref) ? (
        <div className="flex flex-col gap-2 border-t border-black/5 pt-3 dark:border-white/5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {prevArticleHref ? (
            <Link
              href={prevArticleHref}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded border border-black/10 px-3 py-3 text-sm text-foreground/70 transition-colors hover:bg-black/[.04] dark:border-white/10 dark:hover:bg-white/[.06] sm:flex-initial sm:justify-start sm:py-2"
            >
              <span className="shrink-0 text-base leading-none">←</span>
              <span>Previous article</span>
            </Link>
          ) : null}
          {nextArticleHref ? (
            <Link
              href={nextArticleHref}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded border border-black/10 px-3 py-3 text-sm text-foreground/70 transition-colors hover:bg-black/[.04] dark:border-white/10 dark:hover:bg-white/[.06] sm:ml-auto sm:flex-initial sm:justify-end sm:py-2"
            >
              <span>Next article</span>
              <span className="shrink-0 text-base leading-none">→</span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
