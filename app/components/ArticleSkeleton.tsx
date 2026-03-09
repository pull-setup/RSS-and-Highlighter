"use client";

function ArticleSkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface/50">
      <div className="flex min-h-0 flex-1 flex-row gap-1.5 p-2.5 sm:gap-2 sm:p-2.5">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-foreground/15 sm:h-5" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-foreground/10" />
        </div>
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-foreground/15 sm:h-20 sm:w-20" />
      </div>
    </div>
  );
}

export function ArticleSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ArticleSkeletonCard />
        </li>
      ))}
    </ul>
  );
}

function FeedSkeletonCard() {
  return (
    <div className="flex min-h-[64px] items-center gap-2.5 rounded-lg border border-border p-4 sm:gap-3">
      <div className="h-7 w-7 shrink-0 animate-pulse rounded bg-foreground/15 sm:h-8 sm:w-8" />
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-foreground/15 sm:h-11 sm:w-11" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="h-4 w-3/4 animate-pulse rounded bg-foreground/15" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-foreground/10" />
      </div>
      <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-foreground/10" />
    </div>
  );
}

export function FeedsSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <FeedSkeletonCard />
        </li>
      ))}
    </ul>
  );
}

function BookSkeletonCard() {
  return (
    <div className="block rounded-lg border border-border p-4">
      <div className="h-5 w-2/3 animate-pulse rounded bg-foreground/15" />
      <div className="mt-1 h-4 w-1/2 animate-pulse rounded bg-foreground/10" />
    </div>
  );
}

export function BooksSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <BookSkeletonCard />
        </li>
      ))}
    </ul>
  );
}
