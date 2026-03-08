"use client";

import { useState, useEffect, useRef } from "react";

const baseStyle = (v: string) =>
  `sticky top-2 py-3 bg-black/60 backdrop-blur-md ${v === "fullWidth" ? "z-40" : "z-30"}`;
const borderStyle = (stuck: boolean) =>
  stuck ? "border border-gray-500/30" : "border border-transparent";

export function StickyHeader({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "fullWidth";
}) {
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
    "-mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 rounded-3xl mb-6 [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))] [padding-top:max(0.75rem,env(safe-area-inset-top))]";

  return (
    <>
      <div ref={sentinelRef} className="h-px" aria-hidden />
      <div
        className={`${baseStyle(variant)} ${layoutClass} ${borderStyle(stuck)} ${className}`}
      >
        {children}
      </div>
    </>
  );
}
