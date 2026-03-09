"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { invalidateCache } from "@/lib/cache";

export function AddFeedForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to add feed");
        return;
      }
      invalidateCache("/api/feeds");
      router.push(`/feeds/${data.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Feed URL</span>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/feed.xml"
          required
          className="rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-foreground text-background py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add feed"}
      </button>
    </form>
  );
}
