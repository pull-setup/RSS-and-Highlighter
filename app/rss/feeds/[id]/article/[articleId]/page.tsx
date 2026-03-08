import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ArticleContent } from "./ArticleContent";
import { ArticleActions } from "./ArticleActions";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string; articleId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin?callbackUrl=/rss");
  const { id: feedId, articleId } = await params;
  const feedRow = await db.execute({
    sql: "SELECT id, title FROM feeds WHERE id = ? AND user_id = ?",
    args: [feedId, session.user.id],
  });
  if (feedRow.rows.length === 0) notFound();
  const feed = feedRow.rows[0] as { id: number; title: string };
  let articleRow: { rows: Array<Record<string, unknown>> };
  try {
    articleRow = await db.execute({ sql: "SELECT id, url, title, content, author, published_at, is_read, image_url FROM articles WHERE id = ? AND feed_id = ?", args: [articleId, feedId] }) as { rows: Array<Record<string, unknown>> };
  } catch {
    articleRow = await db.execute({ sql: "SELECT id, url, title, content, author, published_at, is_read FROM articles WHERE id = ? AND feed_id = ?", args: [articleId, feedId] }) as { rows: Array<Record<string, unknown>> };
  }
  if (articleRow.rows.length === 0) notFound();
  const row = articleRow.rows[0] as Record<string, unknown>;
  const content = row.content != null ? String(row.content) : null;
  let image_url: string | null = (row.image_url != null && row.image_url !== "") ? String(row.image_url) : null;
  if (!image_url && content) {
    const firstImg = content.match(/<img[^>]+?(?:src|data-src)=["']([^"']+)["']/i)?.[1]?.trim();
    if (firstImg) image_url = firstImg.startsWith("http") ? firstImg : (() => { try { return new URL(firstImg, String(row.url)).href; } catch { return null; } })();
  }
  const article = {
    id: Number(row.id),
    url: String(row.url ?? ""),
    title: String(row.title ?? ""),
    content,
    author: row.author != null ? String(row.author) : null,
    published_at: row.published_at != null ? String(row.published_at) : null,
    is_read: Number(row.is_read),
    image_url,
  };
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/rss/feeds/${feedId}`}
          className="text-sm text-foreground/70 hover:underline"
        >
          ← {feed.title}
        </Link>
      </div>
      <article className="min-w-0">
        {article.image_url && (
          <div className="relative mb-6 aspect-[2/1] w-full overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
            <img
              src={article.image_url}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <header className="mb-6">
          <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {article.title}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-wide text-foreground/60">
            {article.published_at
              ? new Date(article.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).toUpperCase()
              : ""}
            {article.author ? ` • ${article.author.toUpperCase()}` : ""}
          </p>
        </header>
        <ArticleContent content={article.content} />
        <footer className="mt-8 border-t border-black/10 dark:border-white/10 pt-4">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground/70 hover:underline"
          >
            Open original article →
          </a>
        </footer>
      </article>
      <ArticleActions articleId={article.id} isRead={Boolean(article.is_read)} />
    </div>
  );
}
