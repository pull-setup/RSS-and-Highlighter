import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArticleContent } from "./ArticleContent";
import { ArticleActions } from "./ArticleActions";
import { ArticleSummary } from "./ArticleSummary";
import { ArticleTitleSection } from "./ArticleTitleSection";
import { ArticleBottomNav } from "./ArticleBottomNav";
import { ImageWithExpand } from "./ImageWithExpand";

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; articleId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin?callbackUrl=/feeds");
  const { id: feedId, articleId } = await params;
  const { returnTo } = await searchParams;
  const isValidReturnTo =
    returnTo && typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//") && !/^https?:\/\//i.test(returnTo);
  const returnToQuery = isValidReturnTo ? `returnTo=${encodeURIComponent(returnTo)}` : "";
  const feedRow = await db.execute({
    sql: "SELECT id, title FROM feeds WHERE id = ? AND user_id = ?",
    args: [feedId, session.user.id],
  });
  if (feedRow.rows.length === 0) notFound();
  const feed = feedRow.rows[0] as unknown as { id: number; title: string };
  let articleRow: { rows: Array<Record<string, unknown>> };
  try {
    articleRow = await db.execute({ sql: "SELECT id, url, title, content, author, published_at, is_read, is_bookmarked, image_url, summary FROM articles WHERE id = ? AND feed_id = ?", args: [articleId, feedId] }) as { rows: Array<Record<string, unknown>> };
  } catch {
    articleRow = await db.execute({ sql: "SELECT id, url, title, content, author, published_at, is_read, image_url FROM articles WHERE id = ? AND feed_id = ?", args: [articleId, feedId] }) as { rows: Array<Record<string, unknown>> };
  }
  if (articleRow.rows.length === 0) notFound();
  const row = articleRow.rows[0] as Record<string, unknown>;
  const currentId = Number(row.id);
  const ordered = await db.execute({
    sql: "SELECT id, title FROM articles WHERE feed_id = ? ORDER BY published_at DESC, id DESC",
    args: [feedId],
  }) as { rows: Array<Record<string, unknown>> };
  const ids = ordered.rows.map((r) => Number(r.id));
  const idx = ids.indexOf(currentId);
  const prevId = idx > 0 ? ids[idx - 1] : null;
  const nextId = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null;
  const prevArticleHref = prevId != null ? `/feeds/${feedId}/article/${prevId}${returnToQuery ? `?${returnToQuery}` : ""}` : null;
  const nextArticleHref = nextId != null ? `/feeds/${feedId}/article/${nextId}${returnToQuery ? `?${returnToQuery}` : ""}` : null;
  const prevArticleTitle = prevId != null ? String(ordered.rows[idx - 1]?.title ?? "") : null;
  const nextArticleTitle = nextId != null ? String(ordered.rows[idx + 1]?.title ?? "") : null;

  const content = row.content != null ? String(row.content) : null;
  let image_url: string | null = (row.image_url != null && row.image_url !== "") ? String(row.image_url) : null;
  if (!image_url && content) {
    const firstImg = content.match(/<img[^>]+?(?:src|data-src)=["']([^"']+)["']/i)?.[1]?.trim();
    if (firstImg) image_url = firstImg.startsWith("http") ? firstImg : (() => { try { return new URL(firstImg, String(row.url)).href; } catch { return null; } })();
  }
  const summary = row.summary != null && String(row.summary).trim() !== "" ? String(row.summary) : null;
  const wordCount = content
    ? content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readingTimeMinutes = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : null;
  const article = {
    id: Number(row.id),
    url: String(row.url ?? ""),
    title: String(row.title ?? ""),
    content,
    author: row.author != null ? String(row.author) : null,
    published_at: row.published_at != null ? String(row.published_at) : null,
    is_read: Number(row.is_read),
    image_url,
    summary,
  };
  return (
    <div className="flex flex-col gap-4 pb-8 min-w-0">
      <div className="flex flex-col gap-3 min-w-0">
        <ArticleActions
          articleId={article.id}
          isRead={Boolean(article.is_read)}
          isBookmarked={Boolean(row.is_bookmarked)}
          articleUrl={article.url}
          feedId={feedId}
          feedTitle={feed.title}
        />
      <article className="min-w-0">
        <ArticleTitleSection
          title={article.title}
          publishedAt={article.published_at}
          author={article.author}
          readingTimeMinutes={readingTimeMinutes}
        />
        {article.image_url && (
          <ImageWithExpand
            src={article.image_url}
            wrapperClassName="mb-6 min-w-0 overflow-hidden"
            className="aspect-[2/1] w-full object-cover rounded-lg bg-surface"
          />
        )}
        <>
          <ArticleSummary articleId={article.id} initialSummary={article.summary} />
          <ArticleContent content={article.content} />
          <ArticleBottomNav
            prevArticleHref={prevArticleHref}
            nextArticleHref={nextArticleHref}
            prevArticleTitle={prevArticleTitle}
            nextArticleTitle={nextArticleTitle}
          />
        </>
      </article>
      </div>
    </div>
  );
}
