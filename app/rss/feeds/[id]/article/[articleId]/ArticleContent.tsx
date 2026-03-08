"use client";

function stripDangerous(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/\s*on\w+=["'][^"']*["']/gi, "")
    .replace(/\s*on\w+=\s*[^\s>]+/gi, "");
}

export function ArticleContent({ content }: { content: string | null }) {
  if (!content) {
    return <p className="text-foreground/70">No content.</p>;
  }
  const safe = stripDangerous(content);
  return (
    <div
      className="article-body text-foreground [&_img]:max-w-full [&_img]:rounded-lg [&_a]:underline [&_p]:mb-3 [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
