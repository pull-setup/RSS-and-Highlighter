"use client";

export function HighlightText({ text, search }: { text: string; search: string }) {
  if (!search || search.length < 2) return <>{text}</>;
  const sl = search.toLowerCase();
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let pos = 0;
  let key = 0;
  while (pos < text.length) {
    const idx = lower.indexOf(sl, pos);
    if (idx === -1) {
      parts.push(text.slice(pos));
      break;
    }
    parts.push(text.slice(pos, idx));
    parts.push(
        <mark
        key={key++}
        className="bg-amber-200/90 dark:bg-amber-500/40 text-foreground rounded px-0.5 font-medium"
      >
        {text.slice(idx, idx + sl.length)}
      </mark>
    );
    pos = idx + sl.length;
  }
  return <>{parts}</>;
}
