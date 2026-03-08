"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

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

export function Nav() {
  const { data: session, status } = useSession();
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
    <nav className="border-b border-black/10 dark:border-white/10 [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))]">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 min-h-[3rem] sm:min-h-[3.5rem] flex flex-wrap items-center justify-between gap-2 sm:gap-4 py-2 sm:py-0">
        <div className="flex justify-start items-center gap-2 min-h-[44px] min-w-0">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 min-h-[44px] items-center py-1">
            <BookIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
            <span className="text-lg sm:text-xl font-semibold truncate">Reeder</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 min-h-[44px]">
          <Link
            href="/rss"
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline underline-offset-4 py-2 px-1 min-h-[44px] flex items-center dark:text-gray-400 dark:hover:text-gray-300"
          >
            Feeds
          </Link>
          <Link
            href="/highlights"
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline underline-offset-4 py-2 px-1 min-h-[44px] flex items-center dark:text-gray-400 dark:hover:text-gray-300"
          >
            Books
          </Link>
        </div>
        <div className="flex items-center justify-end gap-2 sm:gap-3 min-h-[44px]">
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
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline underline-offset-4 py-2 px-1 min-h-[44px] flex items-center dark:text-gray-400 dark:hover:text-gray-300"
                >
                  2FA
                </Link>
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                aria-label="Sign out"
              >
                <SignOutIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline underline-offset-4 min-h-[44px] flex items-center py-2 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
