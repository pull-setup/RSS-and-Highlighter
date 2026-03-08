"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lightbox } from "./ImageWithExpand";

function stripDangerous(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s*on\w+=["'][^"']*["']/gi, "")
    .replace(/\s*on\w+=\s*[^\s>]+/gi, "")
    // Replace iframes with a safe "View on domain" link instead of removing
    .replace(/<iframe\b([^>]*)>[\s\S]*?<\/iframe>/gi, (_, attrs) => {
      const srcMatch = attrs.match(/\ssrc\s*=\s*["']([^"']+)["']/i) ?? attrs.match(/\ssrc\s*=\s*([^\s>]+)/i);
      const src = srcMatch?.[1]?.trim();
      if (!src || !/^https?:/i.test(src)) return "";
      try {
        const host = new URL(src).hostname.replace(/^www\./, "");
        return `<div class="embed-iframe-placeholder"><a href="${src.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">View on ${host} →</a></div>`;
      } catch {
        return "";
      }
    })
    // Remove links that wrap only an image so clicks open popup, not new tab
    .replace(/<a\s[^>]*>(\s*<img\s[^>]*>\s*)<\/a>/gi, "$1");
}

function decodeAttrs(s: string): string {
  return s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
}

function processTwitterEmbeds(html: string): string {
  return html.replace(
    /<div[^>]*class="twitter-embed"[^>]*data-attrs="([^"]+)"[^>]*>\s*<\/div>/gi,
    (_, raw) => {
      try {
        const a = JSON.parse(decodeAttrs(raw));
        const date = a.date
          ? new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "";
        const text = String(a.full_text ?? "").replace(/\n/g, "<br>");
        const avatar = a.profile_image_url
          ? `<img src="${a.profile_image_url}" referrerpolicy="no-referrer" style="width:40px;height:40px;border-radius:50%;flex-shrink:0;" />`
          : "";
        return `<div class="tweet-card">
          <div class="tweet-header">
            ${avatar}
            <div>
              <div class="tweet-name">${a.name ?? ""}</div>
              <div class="tweet-handle">@${a.username ?? ""}</div>
            </div>
            <svg class="tweet-logo" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.257 5.649 5.907-5.649zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </div>
          <p class="tweet-text">${text}</p>
          <div class="tweet-meta">
            <span>${date}</span>
            <span>💬 ${a.reply_count ?? 0}</span>
            <span>🔁 ${a.retweet_count ?? 0}</span>
            <span>❤️ ${a.like_count ?? 0}</span>
            <a href="${a.url}" target="_blank" rel="noopener noreferrer" class="tweet-link">View on X →</a>
          </div>
        </div>`;
      } catch {
        return "";
      }
    }
  );
}

export function ArticleContent({ content }: { content: string | null }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const container = el.querySelector(".article-body");
    if (!container) return;
    const imgs = container.querySelectorAll<HTMLImageElement>("img");
    imgs.forEach((img) => {
      if (img.closest(".article-image-wrap")) return;
      if (img.closest(".tweet-header")) return;
      if (img.closest(".embedded-post-header")) return;
      // Unwrap image from any ancestor <a> so clicking opens popup instead of new tab
      const anchor = img.closest("a");
      if (anchor) {
        anchor.parentNode?.insertBefore(img, anchor);
        anchor.remove();
      }
      const isInEmbed = !!(img.closest(".tweet-card") || img.closest(".embedded-post-wrap"));
      const wrap = document.createElement("div");
      wrap.className = "article-image-wrap" + (isInEmbed ? " article-image-wrap--embed" : "");
      img.parentNode?.insertBefore(wrap, img);
      wrap.appendChild(img);
      const open = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        setLightboxSrc(img.src);
      };
      wrap.addEventListener("click", open, true);
      img.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, true);
    });
  }, [content, lightboxSrc]);

  if (!content) {
    return <p className="text-foreground/70">No content.</p>;
  }
  const processed = useMemo(
    () => processTwitterEmbeds(stripDangerous(content)),
    [content]
  );

  const lightbox =
    lightboxSrc &&
    typeof document !== "undefined" &&
    createPortal(
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />,
      document.body
    );

  return (
    <>
      <style>{`
        /* article body - mobile-friendly */
        .article-body { overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; overflow-x: hidden; }
        .article-body img { max-width: 100%; height: auto; border-radius: 8px; display: block; margin-left: auto; margin-right: auto; }
        .article-body pre, .article-body code, .article-body table { max-width: 100%; overflow-x: auto; }
        .article-body pre { white-space: pre-wrap; word-break: break-word; }
        .article-body .article-image-wrap img { pointer-events: none; cursor: pointer; }
        .article-body .article-image-wrap { cursor: pointer; }
        .article-body a { text-decoration: underline; color: var(--muted); }
        .article-body a:hover { color: var(--foreground); }
        .article-body p { margin-bottom: 0.75rem; text-align: justify; }
        .article-body h2 { margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.25rem; font-weight: 700; }
        .article-body h3 { margin-top: 1.25rem; margin-bottom: 0.4rem; font-size: 1.1rem; font-weight: 600; }
        .article-body h4, .article-body h5 { margin-top: 1rem; margin-bottom: 0.3rem; font-weight: 600; }
        .article-body ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .article-body ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .article-body li { margin-bottom: 0.25rem; }
        .article-body blockquote { border-left: 3px solid var(--border); padding-left: 1rem; margin: 1rem 0; opacity: 0.8; }
        .article-body figure { margin: 1.25rem auto; text-align: center; }
        .article-body figcaption { font-size: 0.82rem; opacity: 0.6; text-align: center; margin-top: 0.3rem; }
        .article-body video { display: block; margin-left: auto; margin-right: auto; max-width: 100%; border-radius: 8px; }
        /* in-article image wrap (click to open lightbox) */
        .article-body .article-image-wrap { margin: 1.25rem auto; text-align: center; max-width: 100%; }
        .article-body .article-image-wrap img { cursor: pointer; transition: opacity 0.2s; }
        .article-body .article-image-wrap img:hover { opacity: 0.95; }
        /* Substack post embed */
        .article-body .embedded-post-wrap { border: 1px solid rgba(128,128,128,0.2); border-radius: 12px; overflow: hidden; margin: 1.25rem auto; max-width: min(520px, 100%); text-align: left; }
        .article-body .embedded-post { display: block; padding: 16px; text-decoration: none !important; color: inherit; }
        .article-body .embedded-post:hover { background: rgba(128,128,128,0.05); }
        .article-body .embedded-post-header { display: flex; align-items: center; gap: 8px; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(128,128,128,0.15); }
        .article-body .embedded-post-publication-logo { width: 28px; height: 28px; border-radius: 4px; }
        .article-body .embedded-post-publication-name { font-size: 0.85rem; font-weight: 600; }
        .article-body .embedded-post-title { font-weight: 700; font-size: 1rem; margin-bottom: 6px; }
        .article-body .embedded-post-body { font-size: 0.875rem; opacity: 0.7; line-height: 1.5; margin-bottom: 12px; }
        .article-body .embedded-post-cta-wrapper { margin-bottom: 10px; }
        .article-body .embedded-post-cta { display: inline-block; font-size: 0.82rem; font-weight: 600; padding: 4px 12px; border-radius: 4px; border: 1px solid rgba(128,128,128,0.3); }
        .article-body .embedded-post-meta { font-size: 0.78rem; opacity: 0.55; }
        /* iframe placeholder (embeds: video/Substack etc.) */
        .article-body .embed-iframe-placeholder { margin: 1rem 0; padding: 1rem; text-align: center; border: 1px solid rgba(128,128,128,0.2); border-radius: 8px; background: rgba(128,128,128,0.06); max-width: 100%; }
        .article-body .embed-iframe-placeholder a { display: inline-block; padding: 0.5rem 1rem; font-size: 0.9rem; font-weight: 600; text-decoration: none !important; border-radius: 6px; border: 1px solid rgba(128,128,128,0.3); color: var(--foreground); }
        .article-body .embed-iframe-placeholder a:hover { background: rgba(128,128,128,0.1); }
        /* Twitter card */
        .tweet-card { border: 1px solid rgba(128,128,128,0.2); border-radius: 12px; padding: 16px; margin: 1.25rem auto; max-width: min(520px, 100%); text-align: left; }
        .tweet-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; min-width: 0; }
        .tweet-name { font-weight: 700; font-size: 0.95rem; }
        .tweet-handle { font-size: 0.82rem; opacity: 0.6; }
        .tweet-logo { width: 18px; height: 18px; margin-left: auto; flex-shrink: 0; }
        .tweet-text { margin: 0 0 10px; font-size: 0.95rem; line-height: 1.55; }
        .tweet-meta { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; opacity: 0.6; flex-wrap: wrap; min-width: 0; }
        .tweet-link { margin-left: auto; opacity: 1; color: #1d9bf0; text-decoration: none !important; }
      `}</style>
      <div ref={bodyRef} className="min-w-0">
        <div
          className="article-body text-foreground min-w-0"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      </div>
      {lightbox}
    </>
  );
}
