"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "rss-text-zoom";
const MIN = 90;
const MAX = 150;
const STEP = 10;
const DEFAULT = 100;

type TextZoomContextValue = {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
};

const TextZoomContext = createContext<TextZoomContextValue | null>(null);

export function useTextZoom() {
  const ctx = useContext(TextZoomContext);
  return ctx;
}

export function TextZoomProvider({ children }: { children: React.ReactNode }) {
  const [zoom, setZoomState] = useState(DEFAULT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const n = parseInt(stored, 10);
        if (n >= MIN && n <= MAX) setZoomState(n);
      }
    } catch {
      // ignore
    }
  }, [mounted]);

  const setZoom = useCallback((value: number) => {
    const next = Math.min(MAX, Math.max(MIN, value));
    setZoomState(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }
  }, []);

  const zoomIn = useCallback(() => setZoom(zoom + STEP), [zoom, setZoom]);
  const zoomOut = useCallback(() => setZoom(zoom - STEP), [zoom, setZoom]);
  const resetZoom = useCallback(() => setZoom(DEFAULT), [setZoom]);

  const value: TextZoomContextValue = {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
  };

  return (
    <TextZoomContext.Provider value={value}>
      {children}
    </TextZoomContext.Provider>
  );
}

export function TextZoomContent({ children }: { children: React.ReactNode }) {
  return <div className="text-zoom-content">{children}</div>;
}
