"use client";

import { useTextZoom } from "@/app/components/TextZoomContext";

const buttonClass =
  "flex min-h-[36px] min-w-[36px] sm:h-7 sm:w-7 sm:min-h-0 sm:min-w-0 items-center justify-center p-1 text-xs font-semibold transition-colors touch-manipulation";
const defaultClass =
  "text-foreground/70 hover:bg-black/[.04] hover:text-foreground dark:hover:bg-white/[.06]";
const darkClass = "text-white hover:bg-white/10";

export function ZoomControls({ variant = "default" }: { variant?: "default" | "dark" }) {
  const textZoom = useTextZoom();
  if (!textZoom) return null;
  const isDark = variant === "dark";
  return (
    <div
      className={`flex flex-col items-stretch border rounded overflow-hidden shrink-0 divide-y ${
        isDark ? "border-white/20 divide-white/20" : "border-black/10 dark:border-white/10 divide-black/10 dark:divide-white/10"
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
