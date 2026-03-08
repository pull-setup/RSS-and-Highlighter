import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function firstImageFromHtml(html: string, baseUrl?: string): string | null {
  const srcMatch = html.match(/<img[^>]+?(?:src|data-src)=["']([^"']+)["']/i);
  let src = srcMatch?.[1]?.trim();
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (baseUrl && (src.startsWith("/") || src.startsWith("./") || !src.startsWith("http"))) {
    try {
      return new URL(src, baseUrl).href;
    } catch {
      return null;
    }
  }
  return null;
}

function excerptFromHtml(html: string, maxLen = 140): string {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length <= maxLen ? plain : plain.slice(0, maxLen).trim() + "…";
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));
  const readOnly = searchParams.get("readOnly") === "true" || searchParams.get("readOnly") === "1";
  const bookmarkedOnly = searchParams.get("bookmarkedOnly") === "true" || searchParams.get("bookmarkedOnly") === "1";
  const readFilter = readOnly ? " AND a.is_read = 1" : "";
  const bookmarkFilter = bookmarkedOnly ? " AND a.is_bookmarked = 1" : "";
  const orderBy = readOnly || bookmarkedOnly ? "a.published_at DESC, a.id DESC" : "a.is_read ASC, a.published_at DESC, a.id DESC";

  let result: { rows: Array<Record<string, unknown>> };
  try {
    result = await db.execute({
      sql: `SELECT a.id, a.feed_id, a.guid, a.url, a.title, a.content, a.author, a.published_at, a.is_read, a.is_bookmarked, a.created_at, a.image_url
            FROM articles a
            INNER JOIN feeds f ON f.id = a.feed_id AND f.user_id = ?${readFilter}${bookmarkFilter}
            ORDER BY ${orderBy}
            LIMIT ?`,
      args: [session.user.id, limit],
    }) as { rows: Array<Record<string, unknown>> };
  } catch (e: unknown) {
    const msg = String((e as { message?: string })?.message ?? "");
    if (!msg.includes("image_url")) throw e;
    result = await db.execute({
      sql: `SELECT a.id, a.feed_id, a.guid, a.url, a.title, a.content, a.author, a.published_at, a.is_read, a.is_bookmarked, a.created_at
            FROM articles a
            INNER JOIN feeds f ON f.id = a.feed_id AND f.user_id = ?${readFilter}${bookmarkFilter}
            ORDER BY ${orderBy}
            LIMIT ?`,
      args: [session.user.id, limit],
    }) as { rows: Array<Record<string, unknown>> };
  }
  const articles = result.rows.map((row) => {
    const r = row as Record<string, unknown>;
    const content = r.content != null ? String(r.content) : null;
    const baseUrl = String(r.url ?? "");
    const fromDb = r.image_url != null && r.image_url !== "" ? String(r.image_url) : null;
    const thumbnail = fromDb || (content ? firstImageFromHtml(content, baseUrl) : null);
    return {
      id: Number(r.id),
      feed_id: Number(r.feed_id),
      guid: String(r.guid ?? ""),
      url: String(r.url ?? ""),
      title: String(r.title ?? ""),
      content,
      author: r.author != null ? String(r.author) : null,
      published_at: r.published_at != null ? String(r.published_at) : null,
      is_read: Boolean(r.is_read),
      is_bookmarked: Boolean(r.is_bookmarked),
      created_at: String(r.created_at ?? ""),
      thumbnail,
      excerpt: content ? excerptFromHtml(content) : null,
    };
  });
  return NextResponse.json(articles);
}
