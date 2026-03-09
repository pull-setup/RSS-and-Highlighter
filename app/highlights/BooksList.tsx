"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/app/components/EmptyState";
import { LoadingWithLogo } from "@/app/components/LoadingWithLogo";
import { cachedFetch } from "@/lib/cache";
import { updateCacheFooter } from "@/app/components/CacheFooter";

type Book = {
  id: number;
  title: string;
  author: string;
  asin: string | null;
  created_at: string;
};

export function BooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cachedFetch<Book[]>("/api/books")
      .then((result) => {
        setBooks(result.data);
        updateCacheFooter(result.fromCache, result.timestamp);
      })
      .catch(() => setError("Failed to load books"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingWithLogo />;
  if (error) return <p className="text-error">{error}</p>;
  if (books.length === 0) {
    return (
      <EmptyState
        message="No books yet."
        action={{ label: "Add one", href: "/highlights/new" }}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {books.map((book) => (
        <li key={book.id}>
          <Link
            href={`/highlights/books/${book.id}`}
            className="list-item-hover block rounded-lg border border-border p-4 hover:bg-surface"
          >
            <span className="font-medium">{book.title}</span>
            <p className="text-sm text-foreground/70 mt-1">{book.author}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
