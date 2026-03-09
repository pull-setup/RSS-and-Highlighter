"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/app/components/EmptyState";
import { LoadingWithLogo } from "@/app/components/LoadingWithLogo";
import { cachedFetch } from "@/lib/cache";
import { updateCacheFooter } from "@/app/components/CacheFooter";

type Feed = {
  id: number;
  url: string;
  title: string;
  description: string | null;
  site_url: string | null;
  last_fetched_at: string | null;
  created_at: string;
};

function feedFaviconUrl(feed: Feed): string | null {
  try {
    const base = feed.site_url || feed.url;
    if (!base) return null;
    const url = new URL(base);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url.hostname)}&sz=64`;
  } catch {
    return null;
  }
}

export function FeedsList({ search = "" }: { search?: string }) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [failedFavicons, setFailedFavicons] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setLoading(true);
    const ctrl = new AbortController();
    const url = search.trim()
      ? `/api/feeds?search=${encodeURIComponent(search.trim())}`
      : "/api/feeds";
    
    cachedFetch<Feed[]>(url, { signal: ctrl.signal })
      .then((result) => {
        if (!ctrl.signal.aborted) {
          setFeeds(result.data);
          updateCacheFooter(result.fromCache, result.timestamp);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load feeds");
          setLoading(false);
        }
      });
    
    return () => ctrl.abort();
  }, [search]);

  const filtered = feeds;

  if (loading) return <LoadingWithLogo />;
  if (error) return <p className="text-error">{error}</p>;
  if (feeds.length === 0) {
    return (
      <EmptyState
        message={search.trim() ? "No feeds match your search." : "No feeds yet."}
        action={search.trim() ? undefined : { label: "Add one", href: "/feeds/new" }}
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
      {filtered.map((feed, index) => {
        const favicon = feedFaviconUrl(feed);
        const faviconFailed = failedFavicons.has(feed.id);
        const showFavicon = favicon && !faviconFailed;
        const initial = feed.title.trim().slice(0, 1).toUpperCase() || "?";
        return (
          <li key={feed.id}>
            <Link
              href={`/feeds/${feed.id}`}
              className="list-item-hover flex min-h-[64px] items-center gap-2.5 rounded-lg border border-border p-4 transition-colors hover:bg-surface sm:min-h-0 sm:gap-3 sm:p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center text-xs font-semibold text-muted sm:h-8 sm:w-8">
                {index + 1}
              </span>
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface sm:h-11 sm:w-11">
                {showFavicon ? (
                  <img
                    src={favicon}
                    alt=""
                    className="h-full w-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setFailedFavicons((prev) => new Set(prev).add(feed.id));
                    }}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted sm:text-xl">
                    {initial}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-foreground">
                  {feed.title}
                </span>
                {feed.description ? (
                  <p className="mt-0.5 truncate text-sm text-muted line-clamp-1">
                    {feed.description}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 text-muted" aria-hidden>
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
