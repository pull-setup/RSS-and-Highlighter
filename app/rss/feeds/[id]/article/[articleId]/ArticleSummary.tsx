"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function ArticleSummary({
  articleId,
  initialSummary,
}: {
  articleId: number;
  initialSummary: string | null;
}) {
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generatedRef = useRef(false);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${articleId}/summary`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Failed to generate");
        return;
      }
      setSummary((data as { summary: string }).summary);
    } catch {
      setError("Failed to generate");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    if (initialSummary != null && initialSummary.trim() !== "") return;
    if (generatedRef.current) return;
    generatedRef.current = true;
    generate();
  }, [initialSummary, generate]);

  const boxClass =
    "rounded-xl border border-amber-200/60 dark:border-amber-400/20 bg-amber-50/80 dark:bg-amber-950/30 overflow-hidden mb-6";

  if (summary) {
    return (
      <aside className={boxClass} aria-label="Article summary">
        <div className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/90 dark:text-amber-300/90 mb-1.5">AI Summary</p>
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">{summary}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={boxClass} aria-label="Article summary">
      <div className="p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/90 dark:text-amber-300/90 mb-1.5">AI Summary</p>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
        ) : null}
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="text-sm text-amber-800 dark:text-amber-200 hover:underline font-medium disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate AI Summary"}
        </button>
      </div>
    </aside>
  );
}
