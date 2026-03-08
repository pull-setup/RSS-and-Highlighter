"use client";

import { useState, useEffect } from "react";
import { ZoomControls } from "./ZoomControls";
import { useTheme } from "./ThemeProvider";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

const btnClass = "flex min-h-[36px] min-w-[36px] sm:h-7 sm:w-7 sm:min-h-0 sm:min-w-0 items-center justify-center p-1 text-white hover:bg-white/10 transition-colors touch-manipulation";

export function FloatingZoomControls() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY ?? document.documentElement.scrollTop ?? 0;
      setScrolled(y > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!scrolled) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-black/50 dark:bg-black/50 rounded-lg p-1 flex flex-col gap-0.5 [right:max(1rem,env(safe-area-inset-right))] [bottom:max(1rem,env(safe-area-inset-bottom))]"
      aria-hidden
    >
      <div className="flex flex-col items-stretch border-b border-white/20 divide-y divide-white/20 pb-1 mb-0.5">
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-label="Light mode"
          className={`${btnClass} rounded ${theme === "light" ? "bg-white/20" : ""}`}
        >
          <SunIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-label="Dark mode"
          className={`${btnClass} rounded ${theme === "dark" ? "bg-white/20" : ""}`}
        >
          <MoonIcon className="h-4 w-4" />
        </button>
      </div>
      <ZoomControls variant="dark" />
    </div>
  );
}
