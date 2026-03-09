"use client";

import { useEffect, useState } from "react";
import { StickyHeader } from "@/app/components/StickyHeader";
import { LoadingWithLogo } from "@/app/components/LoadingWithLogo";
import { EmptyState } from "@/app/components/EmptyState";
import { cachedFetch, invalidateCache, freshFetch } from "@/lib/cache";
import { updateCacheFooter } from "@/app/components/CacheFooter";
import { RefreshIcon } from "@/app/components/ArticleIcons";

type NewsBriefData = {
  content: string;
  timestamp: number;
};

type TabType = "indian" | "global";

function IndianNewsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function GlobalNewsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function NewsBrief() {
  const [activeTab, setActiveTab] = useState<TabType>("indian");
  const [indianNews, setIndianNews] = useState<NewsBriefData | null>(null);
  const [globalNews, setGlobalNews] = useState<NewsBriefData | null>(null);
  const [loading, setLoading] = useState<{ indian: boolean; global: boolean }>({
    indian: true,
    global: false,
  });
  const [refreshing, setRefreshing] = useState<{ indian: boolean; global: boolean }>({
    indian: false,
    global: false,
  });

  const loadNews = async (type: TabType, useCache = true) => {
    const url = `/api/news/${type}`;
    const isIndian = type === "indian";
    
    if (useCache) {
      setLoading((prev) => ({ ...prev, [type]: true }));
    } else {
      setRefreshing((prev) => ({ ...prev, [type]: true }));
      invalidateCache(`/api/news/${type}`);
    }

    try {
      const result = useCache
        ? await cachedFetch<NewsBriefData>(url)
        : await freshFetch<NewsBriefData>(url);
      
      if (isIndian) {
        setIndianNews(result.data);
      } else {
        setGlobalNews(result.data);
      }
      updateCacheFooter(result.fromCache, result.timestamp);
    } catch {
      if (isIndian) {
        setIndianNews(null);
      } else {
        setGlobalNews(null);
      }
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
      setRefreshing((prev) => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    loadNews("indian", true);
  }, []);

  useEffect(() => {
    if (activeTab === "global" && !globalNews && !loading.global) {
      loadNews("global", true);
    }
  }, [activeTab, globalNews, loading.global]);

  const handleRefresh = () => {
    loadNews(activeTab, false);
  };

  const currentNews = activeTab === "indian" ? indianNews : globalNews;
  const currentLoading = activeTab === "indian" ? loading.indian : loading.global;
  const currentRefreshing = activeTab === "indian" ? refreshing.indian : refreshing.global;

  return (
    <div className="flex flex-col gap-2 min-h-[40vh]">
      <StickyHeader className="flex flex-wrap items-center gap-1.5 relative">
        <h2 className="text-base font-semibold sm:text-lg md:text-xl">✨ News Brief</h2>
        <div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setActiveTab("indian")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors relative ${
              activeTab === "indian"
                ? "text-foreground"
                : "text-muted"
            }`}
          >
            <IndianNewsIcon className="h-4 w-4" />
            <span>Indian News</span>
            {activeTab === "indian" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("global")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors relative ${
              activeTab === "global"
                ? "text-foreground"
                : "text-muted"
            }`}
          >
            <GlobalNewsIcon className="h-4 w-4" />
            <span>Global & American News</span>
            {activeTab === "global" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={currentRefreshing || currentLoading}
            className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-50"
            aria-label="Refresh news"
          >
            <RefreshIcon className={`h-4 w-4 ${currentRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </StickyHeader>
      {currentLoading ? (
        <LoadingWithLogo />
      ) : !currentNews ? (
        <EmptyState message="Failed to load news. Please try again later." />
      ) : (
        <div className="rounded-xl border border-border bg-surface/50 p-4 sm:p-5">
          <div
            className="prose prose-sm sm:prose-base max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-muted prose-ul:text-foreground prose-li:text-foreground news-brief-content"
            dangerouslySetInnerHTML={{ __html: currentNews.content }}
          />
        </div>
      )}
    </div>
  );
}
