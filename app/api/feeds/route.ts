import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_ARTICLES_PER_FEED } from "@/lib/feeds";
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

function matchSearch(text: string | null | undefined, q: string): boolean {
  if (!text || !q.trim()) return false;
  return text.toLowerCase().includes(q.trim().toLowerCase());
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";

  const result = await db.execute({
    sql: `SELECT f.id, f.url, f.title, f.description, f.site_url, f.last_fetched_at, f.created_at
          FROM feeds f
          LEFT JOIN (SELECT feed_id, MAX(published_at) AS latest FROM articles GROUP BY feed_id) a ON a.feed_id = f.id
          WHERE f.user_id = ?
          ORDER BY a.latest IS NULL, a.latest DESC, f.title`,
    args: [userId],
  });
  let feeds = result.rows.map((row) => {
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

  if (search) {
    const searchPattern = `%${search}%`;
    const articleMatch = await db.execute({
      sql: `SELECT DISTINCT a.feed_id FROM articles a
            INNER JOIN feeds f ON f.id = a.feed_id AND f.user_id = ?
            WHERE a.title LIKE ? OR a.content LIKE ?`,
      args: [userId, searchPattern, searchPattern],
    });
    const feedIdsWithMatchingArticles = new Set(
      (articleMatch.rows as Record<string, unknown>[]).map((row) => row.feed_id as number)
    );
    feeds = feeds.filter(
      (f) =>
        matchSearch(f.title as string, search) ||
        matchSearch(f.description as string | null, search) ||
        feedIdsWithMatchingArticles.has(f.id as number)
    );
  }

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
    const items = (feed.items ?? []).slice(0, MAX_ARTICLES_PER_FEED);
    for (const item of items) {
      const guid = item.guid || item.link || item.title || "";
      if (!guid) continue;
      const articleUrl = item.link?.trim() || "";
      const i = item as unknown as Record<string, unknown>;
      const imageUrl = getItemImage({ enclosure: item.enclosure, content: String(i.content ?? ""), contentEncoded: String(i.contentEncoded ?? ""), link: item.link }, articleUrl || feedUrl);
      const content = (String(i.contentEncoded ?? "") || String(i.content ?? "") || String(i.contentSnippet ?? "")).trim();
      const argsWithImage = [feedId, guid, articleUrl, String(i.title ?? "").trim(), content, String(i.creator ?? i.author ?? "") || null, i.pubDate ? new Date(String(i.pubDate)).toISOString() : null, imageUrl];
      try {
        await db.execute({ sql: "INSERT OR IGNORE INTO articles (feed_id, guid, url, title, content, author, published_at, is_read, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)", args: argsWithImage });
        await db.execute({ sql: "UPDATE articles SET content = ?, image_url = ? WHERE guid = ? AND feed_id = ?", args: [content, imageUrl, guid, feedId] });
      } catch (e: unknown) {
        if (String((e as { message?: string })?.message ?? "").includes("image_url")) {
          await db.execute({ sql: "INSERT OR IGNORE INTO articles (feed_id, guid, url, title, content, author, published_at, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)", args: argsWithImage.slice(0, -1) });
          await db.execute({ sql: "UPDATE articles SET content = ? WHERE guid = ? AND feed_id = ?", args: [content, guid, feedId] });
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
