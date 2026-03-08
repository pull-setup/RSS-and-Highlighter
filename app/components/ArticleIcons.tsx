"use client";

export function BookmarkIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string; filled?: boolean }) {
  return (
    <span className={`${className ?? ""} inline-flex items-center justify-center font-medium`} aria-hidden>
      ✓
    </span>
  );
}
