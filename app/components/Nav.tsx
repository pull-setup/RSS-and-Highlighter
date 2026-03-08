"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Nav() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-black/10 dark:border-white/10">
      <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-medium hover:underline underline-offset-4">
            Home
          </Link>
          <Link
            href="/rss"
            className="text-sm text-foreground/80 hover:underline underline-offset-4"
          >
            RSS
          </Link>
          <Link
            href="/highlights"
            className="text-sm text-foreground/80 hover:underline underline-offset-4"
          >
            Highlights
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <span className="text-sm text-foreground/60">...</span>
          ) : session ? (
            <>
              <span className="text-sm text-foreground/70 truncate max-w-[160px]" title={session.user?.email ?? undefined}>
                {session.user?.name || session.user?.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-foreground/70 hover:underline"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
