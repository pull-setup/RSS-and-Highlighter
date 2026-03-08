"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function Sidebar({
  open,
  onClose,
  totpEnabled,
}: {
  open: boolean;
  onClose: () => void;
  totpEnabled: boolean | null;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />
      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[min(280px,85vw)] bg-[var(--background)] border-l border-border shadow-xl transition-transform duration-300 ease-out [padding-right:max(1rem,env(safe-area-inset-right))] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-end px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 pt-2 pb-4 px-4">
          <Link
            href="/feeds"
            onClick={onClose}
            className="px-4 py-3 -mx-4 text-base font-medium text-foreground hover:bg-surface rounded-l-lg transition-colors"
          >
            Feeds
          </Link>
          <Link
            href="/highlights"
            onClick={onClose}
            className="px-4 py-3 -mx-4 text-base font-medium text-foreground hover:bg-surface rounded-l-lg transition-colors"
          >
            Books
          </Link>
          <div className="my-2 border-t border-border" />
          {status === "loading" ? (
            <div className="px-4 py-3 text-sm text-muted">...</div>
          ) : session ? (
            <>
              {totpEnabled === false && (
                <Link
                  href="/auth/totp"
                  onClick={onClose}
                  className="px-4 py-3 text-base font-medium text-foreground hover:bg-surface rounded-l-lg transition-colors"
                >
                  2FA
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-error hover:bg-error/10 rounded-l-lg transition-colors text-left w-full"
                aria-label="Sign out"
              >
                <SignOutIcon className="h-5 w-5 shrink-0" />
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              onClick={onClose}
              className="px-4 py-3 text-base font-medium text-foreground hover:bg-surface rounded-l-lg transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
