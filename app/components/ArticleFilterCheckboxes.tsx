"use client";

import { BookmarkIcon, CheckIcon } from "./ArticleIcons";

export function ArticleFilterCheckboxes({
  bookmarkedOnly,
  readOnly,
  onBookmarkedOnlyChange,
  onReadOnlyChange,
}: {
  bookmarkedOnly: boolean;
  readOnly: boolean;
  onBookmarkedOnlyChange: (v: boolean) => void;
  onReadOnlyChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label
        className={`flex min-h-[40px] min-w-[40px] shrink-0 cursor-pointer items-center justify-center rounded border px-2 py-2 transition-colors ${
          bookmarkedOnly
            ? "border-amber-300/50 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30"
            : "border-black/10 text-foreground/50 hover:bg-black/[.04] dark:border-white/10 dark:hover:bg-white/[.06]"
        }`}
        title="Bookmarked only"
      >
        <input
          type="checkbox"
          checked={bookmarkedOnly}
          onChange={(e) => onBookmarkedOnlyChange(e.target.checked)}
          className="sr-only"
          aria-label="Show bookmarked articles only"
        />
        <BookmarkIcon filled={bookmarkedOnly} className="h-4 w-4" />
      </label>
      <label
        className={`flex min-h-[40px] min-w-[40px] shrink-0 cursor-pointer items-center justify-center rounded border px-2 py-2 transition-colors ${
          readOnly
            ? "border-emerald-300/50 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
            : "border-black/10 text-foreground/50 hover:bg-black/[.04] dark:border-white/10 dark:hover:bg-white/[.06]"
        }`}
        title="Read only"
      >
        <input
          type="checkbox"
          checked={readOnly}
          onChange={(e) => onReadOnlyChange(e.target.checked)}
          className="sr-only"
          aria-label="Show read articles only"
        />
        <CheckIcon filled={readOnly} className="h-4 w-4" />
      </label>
    </div>
  );
}
