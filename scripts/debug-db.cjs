"use strict";
// Shows the first 5 articles per feed: title, content length, image_url
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { createClient } = require("@libsql/client");
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  const feeds = await db.execute("SELECT id, title, url FROM feeds");
  for (const feed of feeds.rows) {
    console.log(`\nFeed [${feed.id}]: ${feed.title}`);
    let rows;
    try {
      rows = await db.execute({
        sql: "SELECT id, title, LENGTH(content) as clen, image_url FROM articles WHERE feed_id = ? ORDER BY id DESC LIMIT 5",
        args: [feed.id],
      });
    } catch {
      rows = await db.execute({
        sql: "SELECT id, title, LENGTH(content) as clen FROM articles WHERE feed_id = ? ORDER BY id DESC LIMIT 5",
        args: [feed.id],
      });
    }
    for (const r of rows.rows) {
      console.log(`  [${r.id}] "${r.title}" | content: ${r.clen ?? 0} chars | image_url: ${r.image_url ?? "(none)"}`);
    }
  }
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
