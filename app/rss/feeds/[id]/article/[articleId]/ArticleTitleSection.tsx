"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArticleZoomControls } from "./ArticleZoomControls";
import { ArticleTextZoom } from "./ArticleTextZoom";
import { ChevronLeftIcon, ChevronRightIcon } from "./ArticleActions";

export function ArticleTitleSection({
  title,
  publishedAt,
  author,
  prevArticleHref,
  nextArticleHref,
}: {
  title: string;
  publishedAt: string | null;
  author: string | null;
  prevArticleHref: string | null;
  nextArticleHref: string | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <div
      className={`sticky top-0 z-40 -mx-4 px-4 py-3 mb-6 border-b transition-[box-shadow,border-color] duration-200 bg-black/50 dark:bg-black/50 [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))] [padding-top:max(0.75rem,env(safe-area-inset-top))] ${
        scrolled
          ? "border-white/20 shadow-sm"
          : "border-white/10"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {prevArticleHref ? (
          <Link
            href={prevArticleHref}
            aria-label="Previous article"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded border border-white/20 text-white transition-colors hover:bg-white/10 active:opacity-80 touch-manipulation"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
        ) : (
          <span className="h-9 w-9 shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <ArticleTextZoom>
            <header>
              <h1 className="text-base font-bold leading-tight text-white truncate sm:text-xl md:text-2xl">
                {title}
              </h1>
              {metaStr ? (
                <p className="mt-0.5 sm:mt-1 text-xs uppercase tracking-wide text-white/80 truncate sm:text-sm">
                  {metaStr}
                </p>
              ) : null}
            </header>
          </ArticleTextZoom>
        </div>
        <ArticleZoomControls variant="dark" />
        {nextArticleHref ? (
          <Link
            href={nextArticleHref}
            aria-label="Next article"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded border border-white/20 text-white transition-colors hover:bg-white/10 active:opacity-80 touch-manipulation"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Link>
        ) : (
          <span className="h-9 w-9 shrink-0" aria-hidden />
        )}
      </div>
    </div>
  );
}
