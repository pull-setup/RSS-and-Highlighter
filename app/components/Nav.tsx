"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BookIcon } from "./BookIcon";
import { SandwichIcon } from "./SandwichIcon";
import { Sidebar } from "./Sidebar";

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
        <div className="max-w-[1140px] mx-auto px-3 sm:px-5 md:px-6 flex items-center justify-between min-h-[2.75rem] py-1.5 sm:py-1 gap-2 [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))]">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-yellow-500 hover:text-yellow-600 min-h-[40px] items-center py-0.5 shrink-0">
            <BookIcon className="h-4 w-5 sm:h-5 sm:w-5 shrink-0" />
            <span className="text-base sm:text-lg font-semibold truncate">ReedSync</span>
          </Link>
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            {status === "loading" ? null : session ? (
              <span className="text-sm text-foreground truncate shrink-0">
                Hi{firstName ? `, ${firstName} !` : " !"}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded p-1.5 text-foreground hover:bg-surface transition-colors"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={sidebarOpen}
            >
              <SandwichIcon className="h-5 w-5 sm:h-6 sm:w-6" open={sidebarOpen} />
            </button>
          </div>
        </div>
      </nav>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} totpEnabled={totpEnabled} />
    </>
  );
}
