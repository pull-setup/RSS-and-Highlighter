"use client";

import { useEffect, useState, useCallback } from "react";
import { StickyHeader } from "@/app/components/StickyHeader";

type Highlight = {
  id: number;
  content: string;
  location: string | null;
  highlighted_at: string | null;
  note: string | null;
  created_at: string;
};

export function HighlightsView({ bookId }: { bookId: string }) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    return fetch(`/api/books/${bookId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed"))))
      .then((data: { highlights: Highlight[] }) => setHighlights(data.highlights))
      .catch(() => setError("Failed to load highlights"))
      .finally(() => setLoading(false));
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-foreground/70">Loading…</p>;
  if (error) return <p className="text-error">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <StickyHeader className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Highlights</h2>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="text-sm text-muted hover:text-foreground hover:underline"
        >
          {showForm ? "Cancel" : "Add highlight"}
        </button>
      </StickyHeader>
      {showForm && (
        <AddHighlightForm
          bookId={bookId}
          onAdded={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
      {highlights.length === 0 && !showForm ? (
        <p className="text-foreground/70">No highlights yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {highlights.map((h) => (
            <li
              key={h.id}
              className="list-item-hover rounded-lg border border-border p-2"
            >
              <p className="text-foreground whitespace-pre-wrap">{h.content}</p>
              {(h.location || h.note) && (
                <div className="mt-2 text-sm text-foreground/60">
                  {h.location && <span>Location: {h.location}</span>}
                  {h.note && (
                    <p className="mt-1 italic">Note: {h.note}</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddHighlightForm({
  bookId,
  onAdded,
}: {
  bookId: string;
  onAdded: () => void;
}) {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/highlights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          location: location.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to add highlight");
        return;
      }
      setContent("");
      setLocation("");
      setNote("");
      onAdded();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 rounded-lg border border-border bg-surface">
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Highlight text</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground resize-y"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Location (optional)</span>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. 1234"
          className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Note (optional)</span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-foreground text-background py-2 px-4 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => { setContent(""); setLocation(""); setNote(""); }}
          className="rounded border border-border py-2 px-4 text-sm text-foreground hover:bg-surface"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
