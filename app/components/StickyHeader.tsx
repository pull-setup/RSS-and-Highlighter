"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

const baseStyle = (v: string) =>
  `sticky top-1 py-1.5 transition-all duration-300 ease-out ${v === "fullWidth" ? "z-40" : "z-30"}`;

function getStuckStyle(stuck: boolean, theme: "light" | "dark") {
  if (!stuck) return "bg-transparent backdrop-blur-none rounded-none border border-transparent";
  if (theme === "light") return "bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/80";
  return "bg-zinc-900/70 backdrop-blur-md rounded-3xl border border-zinc-600/40";
}

export function StickyHeader({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "fullWidth";
}) {
  const { theme } = useTheme();
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const layoutClass =
    "-mx-5 sm:-mx-8 md:-mx-10 px-5 sm:px-8 md:px-10 mb-3 [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))] [padding-top:max(0.25rem,env(safe-area-inset-top))]";

  return (
    <>
      <div ref={sentinelRef} className="h-px" aria-hidden />
      <div
        className={`${baseStyle(variant)} ${layoutClass} ${getStuckStyle(stuck, theme)} ${className}`}
      >
        {children}
      </div>
    </>
  );
}
