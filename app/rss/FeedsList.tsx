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

export function FeedsList() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/feeds")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then(setFeeds)
      .catch(() => setError("Failed to load feeds"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-foreground/70">Loading…</p>;
  if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;
  if (feeds.length === 0) {
    return (
      <p className="text-foreground/70">
        No feeds yet.{" "}
        <Link href="/rss/new" className="underline underline-offset-4">
          Add one
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {feeds.map((feed) => (
        <li key={feed.id}>
          <Link
            href={`/rss/feeds/${feed.id}`}
            className="block rounded-lg border border-black/10 dark:border-white/10 p-4 hover:bg-black/[.02] dark:hover:bg-white/[.06]"
          >
            <span className="font-medium">{feed.title}</span>
            {feed.description && (
              <p className="text-sm text-foreground/70 mt-1 line-clamp-1">
                {feed.description}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
