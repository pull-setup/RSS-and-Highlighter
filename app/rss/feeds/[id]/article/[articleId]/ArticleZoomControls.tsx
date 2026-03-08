"use client";

import { useTextZoom } from "@/app/components/TextZoomContext";

const buttonClass =
  "flex min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 items-center justify-center text-sm font-semibold transition-colors touch-manipulation";
const defaultClass =
  "text-foreground/70 hover:bg-black/[.04] hover:text-foreground dark:hover:bg-white/[.06]";
const darkClass = "text-white hover:bg-white/10";

export function ArticleZoomControls({ variant = "default" }: { variant?: "default" | "dark" }) {
  const textZoom = useTextZoom();
  if (!textZoom) return null;
  const isDark = variant === "dark";
  return (
    <div
      className={`flex items-center gap-0.5 border rounded overflow-hidden shrink-0 ${
        isDark ? "border-white/20" : "border-black/10 dark:border-white/10"
      }`}
    >
      <button
        type="button"
        onClick={textZoom.zoomOut}
        aria-label="Decrease text size"
        className={`${buttonClass} ${isDark ? darkClass : defaultClass}`}
      >
        A−
      </button>
      <button
        type="button"
        onClick={textZoom.resetZoom}
        aria-label="Reset text size"
        className={`${buttonClass} ${isDark ? darkClass : defaultClass}`}
      >
        A
      </button>
      <button
        type="button"
        onClick={textZoom.zoomIn}
        aria-label="Increase text size"
        className={`${buttonClass} ${isDark ? darkClass : defaultClass}`}
      >
        A+
      </button>
    </div>
  );
}
