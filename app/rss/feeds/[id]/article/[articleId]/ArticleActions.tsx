"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BookmarkIcon, CheckIcon } from "@/app/components/ArticleIcons";

function isValidReturnTo(v: string | null): v is string {
  if (!v || typeof v !== "string") return false;
  if (!v.startsWith("/") || v.startsWith("//")) return false;
  if (/^https?:\/\//i.test(v)) return false;
  return true;
}

export function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

export function ArticleActions({
  articleId,
  isRead,
  isBookmarked,
  articleUrl,
  feedId,
  feedTitle,
}: {
  articleId: number;
  isRead: boolean;
  isBookmarked: boolean;
  articleUrl: string;
  feedId: string;
  feedTitle: string;
}) {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const backHref = isValidReturnTo(returnTo) ? returnTo : `/rss/feeds/${feedId}`;
  const [read, setRead] = useState(isRead);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  async function toggleBookmark() {
    const next = !bookmarked;
    const res = await fetch(`/api/articles/${articleId}/bookmark`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_bookmarked: next }),
    });
    if (res.ok) setBookmarked(next);
  }

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
    <div className="flex flex-row items-center justify-between gap-2 min-w-0">
      <Link
        href={backHref}
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center font-bold text-muted transition-colors hover:text-foreground sm:min-h-0 sm:py-0"
        aria-label="Back"
      >
        ←
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded border px-2.5 py-2.5 transition-colors sm:min-h-0 sm:min-w-0 sm:py-1.5 ${
            bookmarked
              ? "border-amber-300/50 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30"
              : "border-border text-foreground/50 hover:bg-surface"
          }`}
        >
          <BookmarkIcon filled={bookmarked} className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={read ? "Mark unread" : "Mark read"}
          className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded border px-2.5 py-2.5 transition-colors sm:min-h-0 sm:min-w-0 sm:py-1.5 ${
            read
              ? "border-emerald-300/50 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
              : "border-border text-foreground/50 hover:bg-surface"
          }`}
        >
          <CheckIcon filled={read} className="h-5 w-5" />
        </button>
        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open original article"
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded border border-border px-2.5 py-2.5 text-foreground/70 transition-colors hover:bg-surface sm:min-h-0 sm:min-w-0 sm:py-1.5"
        >
          <ExternalLinkIcon className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
