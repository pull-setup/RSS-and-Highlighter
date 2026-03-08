"use client";

import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "./ArticleActions";

export function ArticleBottomNav({
  prevArticleHref,
  nextArticleHref,
  prevArticleTitle,
  nextArticleTitle,
}: {
  prevArticleHref: string | null;
  nextArticleHref: string | null;
  prevArticleTitle: string | null;
  nextArticleTitle: string | null;
}) {
  const hasNav = prevArticleHref || nextArticleHref;
  if (!hasNav) return null;

  return (
    <nav
      className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-black/10 dark:border-white/10"
      aria-label="Article navigation"
    >
      {prevArticleHref ? (
        <Link
          href={prevArticleHref}
          aria-label={prevArticleTitle ? `Previous article: ${prevArticleTitle}` : "Previous article"}
          className="flex items-center gap-2 min-w-0 max-w-[50%]"
        >
          <span className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded border border-black/10 p-1.5 dark:border-white/10 text-foreground/70 transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06] active:opacity-80 touch-manipulation">
            <ChevronLeftIcon className="h-5 w-5" />
          </span>
          {prevArticleTitle ? (
            <span className="text-sm text-foreground/70 text-left line-clamp-2 break-words">
              {prevArticleTitle}
            </span>
          ) : null}
        </Link>
      ) : (
        <span className="h-11 w-11 shrink-0" aria-hidden />
      )}
      {nextArticleHref ? (
        <Link
          href={nextArticleHref}
          aria-label={nextArticleTitle ? `Next article: ${nextArticleTitle}` : "Next article"}
          className="flex items-center gap-2 min-w-0 max-w-[50%] ml-auto"
        >
          {nextArticleTitle ? (
            <span className="text-sm text-foreground/70 text-right line-clamp-2 break-words">
              {nextArticleTitle}
            </span>
          ) : null}
          <span className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded border border-black/10 p-1.5 dark:border-white/10 text-foreground/70 transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06] active:opacity-80 touch-manipulation">
            <ChevronRightIcon className="h-5 w-5" />
          </span>
        </Link>
      ) : (
        <span className="h-11 w-11 shrink-0 ml-auto" aria-hidden />
      )}
    </nav>
  );
}
