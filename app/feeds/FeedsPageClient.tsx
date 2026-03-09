"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeftIcon, RefreshIcon } from "@/app/components/ArticleIcons";
import { StickyHeader } from "@/app/components/StickyHeader";
import { FeedsList } from "./FeedsList";

export function FeedsPageClient() {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const feedsListRef = useRef<{ refresh: () => void }>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    feedsListRef.current?.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col gap-4">
      <StickyHeader className="flex flex-col gap-2">
        <h1 className="text-base font-semibold sm:text-lg md:text-xl text-center">RSS Feeds</h1>
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Back to Home"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
          <label className="sr-only" htmlFor="feeds-search">
            Search feeds
          </label>
          <input
            id="feeds-search"
            type="search"
            placeholder="Search feeds…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted min-h-[40px]"
          />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-50"
            aria-label="Refresh feeds"
          >
            <RefreshIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/feeds/new"
            aria-label="Add feed"
            className="shrink-0 flex min-h-[40px] min-w-[40px] items-center justify-center rounded border border-black/20 p-1 text-foreground hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06] touch-manipulation"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </StickyHeader>
      <FeedsList search={search} ref={feedsListRef} />
    </div>
  );
}
