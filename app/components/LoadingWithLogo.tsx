"use client";

import { BookIcon } from "./BookIcon";

export function LoadingWithLogo() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-[var(--accent)]" aria-busy="true" aria-label="Loading">
      <BookIcon className="h-12 w-12 sm:h-14 sm:w-14 animate-loading-breathe" />
      <p className="flex items-center gap-0.5 text-sm text-muted">
        Loading
        <span className="inline-flex gap-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-loading-dot" style={{ animationDelay: "0s" }} aria-hidden />
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-loading-dot" style={{ animationDelay: "0.2s" }} aria-hidden />
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-loading-dot" style={{ animationDelay: "0.4s" }} aria-hidden />
        </span>
      </p>
    </div>
  );
}
