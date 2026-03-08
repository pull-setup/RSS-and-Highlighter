"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeProvider";

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function firstWord(value: string | null | undefined): string {
  if (!value || !value.trim()) return "";
  return value.trim().split(/\s+/)[0] ?? "";
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

export function Nav() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
  const firstName = firstWord(session?.user?.name ?? session?.user?.email ?? null);

  useEffect(() => {
    if (!session) {
      setTotpEnabled(null);
      return;
    }
    fetch("/api/auth/totp/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setTotpEnabled(data.totpEnabled))
      .catch(() => setTotpEnabled(null));
  }, [session]);

  return (
    <nav
      className="z-50 border-b border-border bg-[var(--background)] [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))]"
    >
      <div className="max-w-[1080px] mx-auto px-3 sm:px-4 min-h-[3rem] sm:min-h-[3.5rem] flex flex-wrap items-center justify-between gap-2 sm:gap-4 py-2 sm:py-0">
        <div className="flex justify-start items-center gap-2 min-h-[44px] min-w-0">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-accent hover:text-accent/80 min-h-[44px] items-center py-1">
            <BookIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
            <span className="text-lg sm:text-xl font-semibold truncate">Reeder</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 min-h-[44px]">
          <Link
            href="/rss"
            className="text-sm text-muted hover:text-foreground hover:underline underline-offset-4 py-2 px-1 min-h-[44px] flex items-center"
          >
            Feeds
          </Link>
          <Link
            href="/highlights"
            className="text-sm text-muted hover:text-foreground hover:underline underline-offset-4 py-2 px-1 min-h-[44px] flex items-center"
          >
            Books
          </Link>
        </div>
        <div className="flex items-center justify-end gap-2 sm:gap-3 min-h-[44px]">
          <div className="flex items-center gap-0.5 rounded border border-border p-0.5">
            <button
              type="button"
              onClick={() => setTheme("sepia")}
              aria-label="Sepia mode"
              className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded transition-colors ${
                theme === "sepia" ? "bg-amber-200/50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200" : "text-foreground/50 hover:text-foreground/70"
              }`}
            >
              <SunIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-label="Dark mode"
              className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded transition-colors ${
                theme === "dark" ? "bg-black/10 dark:bg-white/10 text-foreground" : "text-foreground/50 hover:text-foreground/70"
              }`}
            >
              <MoonIcon className="h-4 w-4" />
            </button>
          </div>
          {status === "loading" ? (
            <span className="text-sm text-foreground/60 py-2">...</span>
          ) : session ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground truncate max-w-[120px] sm:max-w-none">
                Hi{firstName ? `, ${firstName} !` : " !"}
              </span>
              {!totpEnabled && (
                <Link
                  href="/auth/totp"
                  className="text-sm text-muted hover:text-foreground hover:underline underline-offset-4 py-2 px-1 min-h-[44px] flex items-center"
                >
                  2FA
                </Link>
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-error hover:bg-error/10"
                aria-label="Sign out"
              >
                <SignOutIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-muted hover:text-foreground hover:underline underline-offset-4 min-h-[44px] flex items-center py-2"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
