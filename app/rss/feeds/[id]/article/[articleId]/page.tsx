import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArticleContent } from "./ArticleContent";
import { ArticleActions } from "./ArticleActions";
import { ImageWithExpand } from "./ImageWithExpand";

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
  const feed = feedRow.rows[0] as unknown as { id: number; title: string };
  let articleRow: { rows: Array<Record<string, unknown>> };
  try {
    articleRow = await db.execute({ sql: "SELECT id, url, title, content, author, published_at, is_read, image_url FROM articles WHERE id = ? AND feed_id = ?", args: [articleId, feedId] }) as { rows: Array<Record<string, unknown>> };
  } catch {
    articleRow = await db.execute({ sql: "SELECT id, url, title, content, author, published_at, is_read FROM articles WHERE id = ? AND feed_id = ?", args: [articleId, feedId] }) as { rows: Array<Record<string, unknown>> };
  }
  if (articleRow.rows.length === 0) notFound();
  const row = articleRow.rows[0] as Record<string, unknown>;
  const currentId = Number(row.id);
  const ordered = await db.execute({
    sql: "SELECT id FROM articles WHERE feed_id = ? ORDER BY published_at DESC, id DESC",
    args: [feedId],
  });
  const ids = ordered.rows.map((r) => Number((r as Record<string, unknown>).id));
  const idx = ids.indexOf(currentId);
  const prevId = idx > 0 ? ids[idx - 1] : null;
  const nextId = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null;
  const prevArticleHref = prevId != null ? `/rss/feeds/${feedId}/article/${prevId}` : null;
  const nextArticleHref = nextId != null ? `/rss/feeds/${feedId}/article/${nextId}` : null;

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
      <div className="flex flex-col gap-4">
        <ArticleActions
          articleId={article.id}
          isRead={Boolean(article.is_read)}
          articleUrl={article.url}
          feedId={feedId}
          feedTitle={feed.title}
          prevArticleHref={prevArticleHref}
          nextArticleHref={nextArticleHref}
        />
      <article className="min-w-0">
        {article.image_url && (
          <ImageWithExpand
            src={article.image_url}
            wrapperClassName="mb-6"
            className="aspect-[2/1] w-full object-cover rounded-lg bg-black/5 dark:bg-white/5"
          />
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
      </article>
      </div>
    </div>
  );
}
