"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { StickyHeader } from "@/app/components/StickyHeader";
import { BooksList } from "./BooksList";
import { RefreshIcon } from "@/app/components/ArticleIcons";

export function HighlightsPageClient() {
  const [refreshing, setRefreshing] = useState(false);
  const booksListRef = useRef<{ refresh: () => void }>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    booksListRef.current?.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <StickyHeader className="flex flex-col gap-2">
          <h1 className="text-base font-semibold sm:text-lg md:text-xl text-center">Kindle Highlights</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-50"
              aria-label="Refresh books"
            >
              <RefreshIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/highlights/new"
              className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Add book
            </Link>
          </div>
        </StickyHeader>
        <BooksList ref={booksListRef} />
      </div>
    </div>
  );
}
