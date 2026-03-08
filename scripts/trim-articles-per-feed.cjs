"use strict";

const path = require("path");
const MAX_PER_FEED = 36;

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

if (!process.env.TURSO_DATABASE_URL) {
  console.error("TURSO_DATABASE_URL is not set. Run with .env.local loaded.");
  process.exit(1);
}

const { createClient } = require("@libsql/client");
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  const feedResult = await db.execute("SELECT id FROM feeds");
  const feedIds = feedResult.rows.map((r) => r.id);
  let totalDeleted = 0;

  for (const feedId of feedIds) {
    const keepResult = await db.execute({
      sql: "SELECT id FROM articles WHERE feed_id = ? ORDER BY published_at DESC, id DESC LIMIT ?",
      args: [feedId, MAX_PER_FEED],
    });
    const keepIds = keepResult.rows.map((r) => r.id);
    if (keepIds.length === 0) {
      const del = await db.execute("DELETE FROM articles WHERE feed_id = ?", [feedId]);
      const n = del.rowsAffected ?? 0;
      if (n > 0) {
        console.log("Feed", feedId, ":", n, "articles deleted (feed now empty).");
        totalDeleted += n;
      }
      continue;
    }
    const placeholders = keepIds.map(() => "?").join(",");
    const del = await db.execute({
      sql: `DELETE FROM articles WHERE feed_id = ? AND id NOT IN (${placeholders})`,
      args: [feedId, ...keepIds],
    });
    const n = del.rowsAffected ?? 0;
    if (n > 0) {
      console.log("Feed", feedId, ":", n, "articles deleted, kept", keepIds.length);
      totalDeleted += n;
    }
  }

  console.log("Done. Total articles deleted:", totalDeleted);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
