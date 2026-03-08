"use client";

import { useTextZoom } from "@/app/components/TextZoomContext";

const DEFAULT_ZOOM = 100;

export function ArticleTextZoom({ children }: { children: React.ReactNode }) {
  const ctx = useTextZoom();
  const zoom = ctx?.zoom ?? DEFAULT_ZOOM;
  const scale = zoom / 100;
  return (
    <div
      className="article-text-zoom min-w-0"
      style={
        scale !== 1
          ? ({ zoom: scale } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
