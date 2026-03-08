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

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const readOnly = searchParams.get("readOnly") === "true" || searchParams.get("readOnly") === "1";
  const readFilter = readOnly ? " AND a.is_read = 1" : "";

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) AS total FROM articles a INNER JOIN feeds f ON f.id = a.feed_id AND f.user_id = ?${readFilter}`,
    args: [session.user.id],
  });
  const total = Number((countResult.rows[0] as unknown as { total: number }).total ?? 0);

  const orderBy = readOnly ? "a.published_at DESC, a.id DESC" : "a.is_read ASC, a.published_at DESC, a.id DESC";

  let result: { rows: Array<Record<string, unknown>> };
  try {
    result = await db.execute({
      sql: `SELECT a.id, a.feed_id, a.guid, a.url, a.title, a.content, a.author, a.published_at, a.is_read, a.created_at, a.image_url
            FROM articles a INNER JOIN feeds f ON f.id = a.feed_id AND f.user_id = ?${readFilter}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?`,
      args: [session.user.id, limit, offset],
    }) as { rows: Array<Record<string, unknown>> };
  } catch (e: unknown) {
    const msg = String((e as { message?: string })?.message ?? "");
    if (!msg.includes("image_url")) throw e;
    result = await db.execute({
      sql: `SELECT a.id, a.feed_id, a.guid, a.url, a.title, a.content, a.author, a.published_at, a.is_read, a.created_at
            FROM articles a INNER JOIN feeds f ON f.id = a.feed_id AND f.user_id = ?${readFilter}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?`,
      args: [session.user.id, limit, offset],
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
      created_at: String(r.created_at ?? ""),
      thumbnail,
      excerpt: content ? excerptFromHtml(content) : null,
    };
  });
  return NextResponse.json({ articles, total });
}
