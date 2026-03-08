"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const router = useRouter();
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
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex min-h-[44px] min-w-0 items-center gap-1.5 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700 sm:min-h-0 sm:py-0 text-left dark:text-gray-400 dark:hover:text-gray-300"
        >
          <span className="shrink-0 text-base leading-none">←</span>
          <span className="truncate">Back</span>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open original article"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded border border-black/10 px-2.5 py-2.5 text-foreground/70 transition-colors hover:bg-black/[.04] dark:border-white/10 dark:hover:bg-white/[.06] sm:min-h-0 sm:min-w-0 sm:py-1.5"
          >
            <ExternalLinkIcon className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={toggle}
            aria-label={read ? "Mark unread" : "Mark read"}
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
    </div>
  );
}
