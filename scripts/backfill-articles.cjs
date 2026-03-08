"use strict";
// One-time backfill: re-fetches each feed and updates articles
// with full content (content:encoded) and image_url.
// Run: node scripts/backfill-articles.cjs

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { createClient } = require("@libsql/client");
const Parser = require("rss-parser");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const parser = new Parser({
  customFields: { item: [["content:encoded", "contentEncoded"]] },
});

function getItemImage(item, baseUrl) {
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
  try { return new URL(src, baseUrl).href; } catch { return null; }
}

(async () => {
  const feeds = await db.execute("SELECT id, url, title FROM feeds");
  for (const feed of feeds.rows) {
    console.log(`\nProcessing feed [${feed.id}]: ${feed.title}`);
    let parsed;
    try {
      parsed = await parser.parseURL(feed.url);
    } catch (e) {
      console.error("  Failed to fetch feed:", e.message);
      continue;
    }
    let updated = 0;
    for (const item of parsed.items ?? []) {
      const guid = item.guid || item.link || item.title || "";
      if (!guid) continue;
      const articleUrl = item.link?.trim() || "";
      const i = item;
      const imageUrl = getItemImage({ enclosure: i.enclosure, content: String(i.content ?? ""), contentEncoded: String(i.contentEncoded ?? ""), link: i.link }, articleUrl || feed.url);
      const content = (String(i.contentEncoded ?? "") || String(i.content ?? "") || String(i.contentSnippet ?? "")).slice(0, 50000);
      try {
        const r = await db.execute({
          sql: "UPDATE articles SET content = ?, image_url = ? WHERE guid = ? AND feed_id = ?",
          args: [content, imageUrl, guid, feed.id],
        });
        if (r.rowsAffected > 0) updated++;
      } catch {
        try {
          await db.execute({
            sql: "UPDATE articles SET content = ? WHERE guid = ? AND feed_id = ?",
            args: [content, guid, feed.id],
          });
          updated++;
        } catch (e2) {
          console.error("  Update failed for guid:", guid, e2.message);
        }
      }
    }
    console.log(`  Updated ${updated} articles.`);
  }
  console.log("\nBackfill complete.");
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
