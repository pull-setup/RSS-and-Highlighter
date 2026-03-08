"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Image"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-white/10 sm:right-4 sm:top-4"
        style={{ top: "max(0.75rem, env(safe-area-inset-top, 0.75rem))", right: "max(0.75rem, env(safe-area-inset-right, 0.75rem))" }}
        aria-label="Close"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <img
          src={src}
          alt=""
          className="max-h-full max-w-full object-contain"
          referrerPolicy="no-referrer"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

export function ImageWithExpand({
  src,
  alt = "",
  className = "",
  wrapperClassName = "",
}: {
  src: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  return (
    <>
      <div className={`flex flex-col items-center ${wrapperClassName}`}>
        <div
          className="cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-95 active:opacity-90"
          onClick={() => setLightboxOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && setLightboxOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Expand image"
        >
          <img
            src={src}
            alt={alt}
            className={className}
            referrerPolicy="no-referrer"
            draggable={false}
          />
        </div>
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="mt-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-black/10 p-2.5 text-foreground/60 transition-colors hover:bg-black/[.04] hover:text-foreground dark:border-white/10 dark:hover:bg-white/[.06] sm:min-h-0 sm:min-w-0 sm:p-2"
          aria-label="Full screen"
        >
          <ExpandIcon className="h-5 w-5" />
        </button>
      </div>
      {lightboxOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <Lightbox src={src} onClose={() => setLightboxOpen(false)} />,
          document.body
        )}
    </>
  );
}

export { ExpandIcon, Lightbox };
