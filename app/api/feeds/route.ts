import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Parser from "rss-parser";

const parser = new Parser();

function getItemImage(item: { enclosure?: { url?: string; type?: string }; content?: string; link?: string }, baseUrl: string): string | null {
  const enc = item.enclosure?.url;
  if (enc) {
    const t = (item.enclosure?.type ?? "").toLowerCase();
    if (t.startsWith("image/") || !t) return enc;
  }
  const content = item.content ?? "";
  const m = content.match(/<img[^>]+?(?:src|data-src)=["']([^"']+)["']/i);
  const src = m?.[1]?.trim();
  if (!src) return null;
  if (src.startsWith("http")) return src;
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return null;
  }
}

// e.g. substack.com -> substack.com/feed
async function resolveFeedUrl(inputUrl: string): Promise<string> {
  const trimmed = inputUrl.replace(/\/+$/, "");
  const looksLikeFeed =
    /\.(xml|rss)$/i.test(trimmed) ||
    /\/feed\/?$/i.test(trimmed) ||
    /\/rss\/?$/i.test(trimmed);
  if (looksLikeFeed) return trimmed;

  const toTry = [
    trimmed,
    `${trimmed}/feed`,
    `${trimmed}/feed.xml`,
    `${trimmed}/rss`,
    `${trimmed}/rss.xml`,
  ];
  for (const url of toTry) {
    try {
      await parser.parseURL(url);
      return url;
    } catch {
      continue;
    }
  }
  throw new Error("Invalid or unreachable feed URL");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const result = await db.execute({
    sql: "SELECT id, url, title, description, site_url, last_fetched_at, created_at FROM feeds WHERE user_id = ? ORDER BY title",
    args: [userId],
  });
  const feeds = result.rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id,
      url: r.url,
      title: r.title,
      description: r.description ?? null,
      site_url: r.site_url ?? null,
      last_fetched_at: r.last_fetched_at ?? null,
      created_at: r.created_at,
    };
  });
  return NextResponse.json(feeds);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const body = await req.json();
  const url = typeof body.url === "string" ? body.url.trim() : null;
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }
  try {
    const feedUrl = await resolveFeedUrl(url);
    const feed = await parser.parseURL(feedUrl);
    const title = feed.title?.trim() || url;
    const description = feed.description?.trim() || null;
    const siteUrl = feed.link?.trim() || null;
    const insert = await db.execute({
      sql: "INSERT INTO feeds (user_id, url, title, description, site_url) VALUES (?, ?, ?, ?, ?)",
      args: [userId, feedUrl, title, description, siteUrl],
    });
    const feedId = Number(insert.lastInsertRowid ?? 0);
    const now = new Date().toISOString();
    for (const item of feed.items ?? []) {
      const guid = item.guid || item.link || item.title || "";
      if (!guid) continue;
      const articleUrl = item.link?.trim() || "";
      const imageUrl = getItemImage(item, articleUrl || feedUrl);
      const argsWithImage = [feedId, guid, articleUrl, (item.title ?? "").trim(), (item.content ?? item.contentSnippet ?? "").slice(0, 50000), item.creator ?? item.author ?? null, item.pubDate ? new Date(item.pubDate).toISOString() : null, imageUrl];
      try {
        await db.execute({ sql: "INSERT OR IGNORE INTO articles (feed_id, guid, url, title, content, author, published_at, is_read, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)", args: argsWithImage });
      } catch (e: unknown) {
        if (String((e as { message?: string })?.message ?? "").includes("image_url")) {
          await db.execute({ sql: "INSERT OR IGNORE INTO articles (feed_id, guid, url, title, content, author, published_at, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)", args: argsWithImage.slice(0, -1) });
        }
      }
    }
    await db.execute({
      sql: "UPDATE feeds SET last_fetched_at = ? WHERE id = ?",
      args: [now, feedId],
    });
    return NextResponse.json({
      id: feedId,
      title,
      description,
      site_url: siteUrl,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Invalid or unreachable feed URL" },
      { status: 400 }
    );
  }
}
