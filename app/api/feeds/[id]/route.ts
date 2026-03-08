import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: { item: [["content:encoded", "contentEncoded"]] },
});

type FeedItem = {
  enclosure?: { url?: string; type?: string };
  content?: string;
  contentEncoded?: string;
  link?: string;
};

function getItemImage(item: FeedItem, baseUrl: string): string | null {
  const enc = item.enclosure?.url;
  if (enc) {
    const t = (item.enclosure?.type ?? "").toLowerCase();
    if (t.startsWith("image/") || !t) return enc;
  }
  const html = item.contentEncoded ?? item.content ?? "";
  const m = html.match(/<img[^>]+?(?:src|data-src)=["']([^"']+)["']/i);
  const src = m?.[1]?.trim();
  if (!src) return null;
  if (src.startsWith("http")) return src;
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const row = await db.execute({
    sql: "SELECT id, url, title, description, site_url, last_fetched_at, created_at FROM feeds WHERE id = ? AND user_id = ?",
    args: [id, session.user.id],
  });
  if (row.rows.length === 0) {
    return NextResponse.json({ error: "Feed not found" }, { status: 404 });
  }
  const r = row.rows[0] as Record<string, unknown>;
  return NextResponse.json({
    id: r.id,
    url: r.url,
    title: r.title,
    description: r.description ?? null,
    site_url: r.site_url ?? null,
    last_fetched_at: r.last_fetched_at ?? null,
    created_at: r.created_at,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const result = await db.execute({
    sql: "DELETE FROM feeds WHERE id = ? AND user_id = ?",
    args: [id, session.user.id],
  });
  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: "Feed not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const row = await db.execute({
    sql: "SELECT id, url FROM feeds WHERE id = ? AND user_id = ?",
    args: [id, session.user.id],
  });
  if (row.rows.length === 0) {
    return NextResponse.json({ error: "Feed not found" }, { status: 404 });
  }
  const url = (row.rows[0] as unknown as { url: string }).url;
  try {
    const feed = await parser.parseURL(url);
    const now = new Date().toISOString();
    const items = (feed.items ?? []).slice(0, 36);
    const keptGuids: string[] = [];
    for (const item of items) {
      const guid = item.guid || item.link || item.title || "";
      if (!guid) continue;
      keptGuids.push(guid);
      const articleUrl = item.link?.trim() || "";
      const i = item as unknown as Record<string, unknown>;
      const imageUrl = getItemImage({ enclosure: item.enclosure, content: String(i.content ?? ""), contentEncoded: String(i.contentEncoded ?? ""), link: item.link }, articleUrl || url);
      const content = (String(i.contentEncoded ?? "") || String(i.content ?? "") || String(i.contentSnippet ?? "")).trim();
      const argsWithImage = [id, guid, articleUrl, String(i.title ?? "").trim(), content, String(i.creator ?? i.author ?? "") || null, i.pubDate ? new Date(String(i.pubDate)).toISOString() : null, imageUrl];
      try {
        await db.execute({ sql: "INSERT OR IGNORE INTO articles (feed_id, guid, url, title, content, author, published_at, is_read, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)", args: argsWithImage });
        await db.execute({ sql: "UPDATE articles SET content = ?, image_url = ? WHERE guid = ? AND feed_id = ?", args: [content, imageUrl, guid, id] });
      } catch (e: unknown) {
        if (String((e as { message?: string })?.message ?? "").includes("image_url")) {
          await db.execute({ sql: "INSERT OR IGNORE INTO articles (feed_id, guid, url, title, content, author, published_at, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)", args: argsWithImage.slice(0, -1) });
          await db.execute({ sql: "UPDATE articles SET content = ? WHERE guid = ? AND feed_id = ?", args: [content, guid, id] });
        }
      }
    }
    if (keptGuids.length > 0) {
      const placeholders = keptGuids.map(() => "?").join(",");
      await db.execute({
        sql: `DELETE FROM articles WHERE feed_id = ? AND guid NOT IN (${placeholders})`,
        args: [id, ...keptGuids],
      });
    } else {
      await db.execute({ sql: "DELETE FROM articles WHERE feed_id = ?", args: [id] });
    }
    await db.execute({
      sql: "UPDATE feeds SET last_fetched_at = ? WHERE id = ?",
      args: [now, id],
    });
    return NextResponse.json({ ok: true, last_fetched_at: now });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 400 }
    );
  }
}
