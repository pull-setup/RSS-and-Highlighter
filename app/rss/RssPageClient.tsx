"use client";

import { useState } from "react";
import Link from "next/link";
import { StickyHeader } from "@/app/components/StickyHeader";
import { FeedsList } from "./FeedsList";

export function RssPageClient() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <StickyHeader className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
        <h1 className="text-xl font-semibold sm:text-2xl">RSS Feeds</h1>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-initial sm:items-center sm:min-w-0 sm:max-w-[480px]">
          <label className="sr-only" htmlFor="feeds-search">
            Search feeds
          </label>
          <input
            id="feeds-search"
            type="search"
            placeholder="Search feeds…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted min-h-[44px] min-w-[180px] sm:min-w-[280px] sm:max-w-[400px]"
          />
          <Link
            href="/rss/new"
            aria-label="Add feed"
            className="shrink-0 flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-black/20 text-foreground hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06] touch-manipulation"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </StickyHeader>
      <FeedsList search={search} />
    </div>
  );
}
