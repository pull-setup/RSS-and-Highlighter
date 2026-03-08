"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddBookForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [asin, setAsin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          asin: asin.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to add book");
        return;
      }
      router.push(`/highlights/books/${data.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Author</span>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className="rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">ASIN (optional)</span>
        <input
          type="text"
          value={asin}
          onChange={(e) => setAsin(e.target.value)}
          placeholder="B00..."
          className="rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-foreground text-background py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add book"}
      </button>
    </form>
  );
}
