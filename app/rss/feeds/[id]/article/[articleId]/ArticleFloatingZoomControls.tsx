"use client";

import { useState, useEffect } from "react";
import { ArticleZoomControls } from "./ArticleZoomControls";

export function ArticleFloatingZoomControls() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!scrolled) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 bg-black/50 dark:bg-black/50 rounded-lg p-1 [right:max(1.5rem,env(safe-area-inset-right))] [bottom:max(1.5rem,env(safe-area-inset-bottom))]"
      aria-hidden
    >
      <ArticleZoomControls variant="dark" />
    </div>
  );
}
