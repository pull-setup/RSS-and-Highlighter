import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; articleId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: feedId, articleId } = await params;
  const feedRow = await db.execute({
    sql: "SELECT id FROM feeds WHERE id = ? AND user_id = ?",
    args: [feedId, session.user.id],
  });
  if (feedRow.rows.length === 0) {
    return NextResponse.json({ error: "Feed not found" }, { status: 404 });
  }
  let row: { rows: Array<Record<string, unknown>> };
  try {
    row = await db.execute({ sql: "SELECT id, guid, url, title, content, author, published_at, is_read, image_url FROM articles WHERE id = ? AND feed_id = ?", args: [articleId, feedId] }) as { rows: Array<Record<string, unknown>> };
  } catch (e: unknown) {
    if (!String((e as { message?: string })?.message ?? "").includes("image_url")) throw e;
    row = await db.execute({ sql: "SELECT id, guid, url, title, content, author, published_at, is_read FROM articles WHERE id = ? AND feed_id = ?", args: [articleId, feedId] }) as { rows: Array<Record<string, unknown>> };
  }
  if (row.rows.length === 0) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  const r = row.rows[0] as Record<string, unknown>;
  const content = r.content != null ? String(r.content) : null;
  let image_url: string | null = (r.image_url != null && r.image_url !== "") ? String(r.image_url) : null;
  if (!image_url && content) {
    const firstImg = content.match(/<img[^>]+?(?:src|data-src)=["']([^"']+)["']/i)?.[1]?.trim();
    if (firstImg) image_url = firstImg.startsWith("http") ? firstImg : (() => { try { return new URL(firstImg, String(r.url)).href; } catch { return null; } })();
  }
  return NextResponse.json({
    id: Number(r.id),
    guid: String(r.guid ?? ""),
    url: String(r.url ?? ""),
    title: String(r.title ?? ""),
    content,
    author: r.author != null ? String(r.author) : null,
    published_at: r.published_at != null ? String(r.published_at) : null,
    is_read: Boolean(r.is_read),
    image_url: image_url || null,
  });
}
