"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    const url = search.trim()
      ? `/api/feeds?search=${encodeURIComponent(search.trim())}`
      : "/api/feeds";
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then(setFeeds)
      .catch(() => setError("Failed to load feeds"))
      .finally(() => setLoading(false));
  }, [search]);

  const filtered = feeds;

  if (loading) return <p className="text-foreground/70">Loading…</p>;
  if (error) return <p className="text-error">{error}</p>;
  if (feeds.length === 0) {
    return (
      <p className="text-foreground/70">
        No feeds yet.{" "}
        <Link href="/rss/new" className="text-muted underline underline-offset-4 hover:text-foreground">
          Add one
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {filtered.map((feed, index) => {
        const favicon = feedFaviconUrl(feed);
        const faviconFailed = failedFavicons.has(feed.id);
        const showFavicon = favicon && !faviconFailed;
        const initial = feed.title.trim().slice(0, 1).toUpperCase() || "?";
        return (
          <li key={feed.id}>
            <Link
              href={`/rss/feeds/${feed.id}`}
              className="list-item-hover flex min-h-[72px] items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-surface sm:min-h-0 sm:gap-4 sm:p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-sm font-semibold text-muted sm:h-9 sm:w-9">
                {index + 1}
              </span>
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface sm:h-14 sm:w-14">
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
      {filtered.length === 0 && (
        <li className="col-span-full text-muted text-sm">No feeds match your search.</li>
      )}
    </ul>
  );
}
