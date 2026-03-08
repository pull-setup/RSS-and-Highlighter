"use client";

import { useState } from "react";
import Link from "next/link";
import { FeedsList } from "./FeedsList";

export function RssPageClient() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">RSS Feeds</h1>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:min-w-[200px]">
            <label className="sr-only" htmlFor="feeds-search">
              Search feeds
            </label>
            <input
              id="feeds-search"
              type="search"
              placeholder="Search feeds…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 dark:border-white/10 sm:max-w-[220px]"
            />
            <Link
              href="/rss/new"
              className="shrink-0 rounded bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Add feed
            </Link>
          </div>
        </div>
      <FeedsList search={search} />
    </div>
  );
}
