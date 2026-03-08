"use client";

import Link from "next/link";

export function EmptyState({
  message,
  action,
  className = "",
}: {
  message: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-border border-dashed bg-surface py-8 px-4 ${className}`}
    >
      <p className="text-foreground/60 text-sm text-center">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-2 text-sm text-muted underline underline-offset-4 hover:text-foreground"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
