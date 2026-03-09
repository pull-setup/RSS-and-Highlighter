"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { BookIcon } from "./BookIcon";
import { SandwichIcon } from "./SandwichIcon";
import { Sidebar } from "./Sidebar";

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <>
      <nav
        className="z-50 border-b border-border bg-[var(--background)]"
      >
        <div className="max-w-[1020px] mx-auto px-3 sm:px-5 md:px-6 flex items-center min-h-[2.75rem] py-1.5 sm:py-1 gap-2 relative [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))]">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-yellow-500 hover:text-yellow-600 min-h-[40px] items-center py-0.5 shrink-0">
            <BookIcon className="h-4 w-5 sm:h-5 sm:w-5 shrink-0" />
            <span className="text-xl sm:text-2xl font-semibold truncate">ReedSync</span>
          </Link>
          {status === "loading" ? null : session ? (
            <>
              <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                <Link href="/feeds" className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface rounded transition-colors">Feeds</Link>
                <Link href="/highlights" className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface rounded transition-colors">Books</Link>
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                <span className="hidden sm:inline text-sm text-foreground truncate shrink-0">
                  Hi{firstName ? `, ${firstName} !` : " !"}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden md:flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded p-1.5 text-error hover:bg-error/10 transition-colors"
                  aria-label="Sign out"
                >
                  <SignOutIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarOpen((o) => !o)}
                  className="md:hidden flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded p-1.5 text-foreground hover:bg-surface transition-colors"
                  aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                  aria-expanded={sidebarOpen}
                >
                  <SandwichIcon className="h-5 w-5 sm:h-6 sm:w-6" open={sidebarOpen} />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </nav>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} totpEnabled={totpEnabled} />
    </>
  );
}
