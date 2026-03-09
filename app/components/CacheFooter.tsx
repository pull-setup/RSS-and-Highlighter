"use client";

import { useEffect, useState } from "react";

interface CacheInfo {
  fromCache: boolean;
  timestamp: number;
}

export function CacheFooter() {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Listen for cache info updates from components
    const handleCacheUpdate = (event: CustomEvent<CacheInfo>) => {
      setCacheInfo(event.detail);
    };

    window.addEventListener("cache-update" as any, handleCacheUpdate);
    return () => {
      window.removeEventListener("cache-update" as any, handleCacheUpdate);
    };
  }, []);

  const date = cacheInfo ? new Date(cacheInfo.timestamp) : null;
  const timeStr = date
    ? date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;
  const dateStr = date
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <footer className="border-t border-border bg-[var(--surface)] mt-auto">
      <div className="max-w-[960px] mx-auto px-3 py-6 sm:px-5 md:px-6 [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))]">
        <div className="flex flex-col gap-4">
          {/* App Description */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-foreground">ReedSync</h3>
            <p className="text-xs text-muted leading-relaxed max-w-2xl">
              Your personal knowledge hub combining RSS feeds and Kindle highlights. 
              Stay updated with your favorite content sources and organize your reading 
              insights in one unified platform.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {/* Copyright */}
              <div className="flex items-center gap-1">
                <span>© {currentYear} ReedSync.</span>
                <span className="hidden sm:inline">All rights reserved.</span>
              </div>

              {/* Developed by */}
              <div className="flex items-center gap-1">
                <span>Developed with</span>
                <span className="text-red-500" aria-label="love">♥</span>
                <span>by Naveen Kumar Reddy Mettu</span>
              </div>
            </div>

            {/* Cache Status */}
            {cacheInfo && timeStr && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted">Updated:</span>
                  <span className="font-medium text-foreground/80">
                    {dateStr} at {timeStr}
                  </span>
                </div>
                {cacheInfo.fromCache && (
                  <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium border border-border/50">
                    Cached
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Helper function to dispatch cache info to the footer
 */
export function updateCacheFooter(fromCache: boolean, timestamp: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CacheInfo>("cache-update", {
      detail: { fromCache, timestamp },
    })
  );
}
