"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    fetch("/api/books")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed"))))
      .then(setBooks)
      .catch(() => setError("Failed to load books"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-foreground/70">Loading…</p>;
  if (error) return <p className="text-error">{error}</p>;
  if (books.length === 0) {
    return (
      <p className="text-foreground/70">
        No books yet.{" "}
        <Link href="/highlights/new" className="underline underline-offset-4">
          Add one
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
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
