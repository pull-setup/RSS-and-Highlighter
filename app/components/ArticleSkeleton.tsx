"use client";

function ArticleSkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border">
      <div className="flex min-h-0 flex-1 flex-row gap-1.5 p-1.5 sm:gap-2 sm:p-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-foreground/10 sm:h-5" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-foreground/5" />
        </div>
        <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-foreground/10 sm:h-24 sm:w-24" />
      </div>
    </div>
  );
}

export function ArticleSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ArticleSkeletonCard />
        </li>
      ))}
    </ul>
  );
}
