"use strict";

const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

if (!process.env.TURSO_DATABASE_URL) {
  console.error(
    "TURSO_DATABASE_URL is not set. Create .env.local with TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN if using Turso Cloud), then run: npm run db:migrate"
  );
  process.exit(1);
}

const { createClient } = require("@libsql/client");
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  const schemaPath = path.join(__dirname, "..", "lib", "schema.sql");
  let schema = fs.readFileSync(schemaPath, "utf-8");
  schema = schema.replace(/^\s*--[^\n]*$/gm, "");
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await db.execute(statement);
    } catch (err) {
      console.error("Statement failed:", statement.slice(0, 80) + "...");
      throw err;
    }
  }

  try {
    await db.execute("ALTER TABLE articles ADD COLUMN image_url TEXT");
    console.log("Added image_url column to articles");
  } catch (err) {
    const msg = String(err?.message ?? err?.cause?.message ?? "");
    if (!/duplicate column|already exists/i.test(msg)) throw err;
  }

  try {
    await db.execute("ALTER TABLE articles ADD COLUMN summary TEXT");
    console.log("Added summary column to articles");
  } catch (err) {
    const msg = String(err?.message ?? err?.cause?.message ?? "");
    if (!/duplicate column|already exists/i.test(msg)) throw err;
  }

  try {
    await db.execute("ALTER TABLE users ADD COLUMN totp_secret TEXT");
    console.log("Added totp_secret column to users");
  } catch (err) {
    const msg = String(err?.message ?? err?.cause?.message ?? "");
    if (!/duplicate column|already exists/i.test(msg)) throw err;
  }

  try {
    await db.execute("ALTER TABLE users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0");
    console.log("Added totp_enabled column to users");
  } catch (err) {
    const msg = String(err?.message ?? err?.cause?.message ?? "");
    if (!/duplicate column|already exists/i.test(msg)) throw err;
  }

  try {
    await db.execute("ALTER TABLE articles ADD COLUMN is_bookmarked INTEGER NOT NULL DEFAULT 0");
    console.log("Added is_bookmarked column to articles");
  } catch (err) {
    const msg = String(err?.message ?? err?.cause?.message ?? "");
    if (!/duplicate column|already exists/i.test(msg)) throw err;
  }

  console.log("Migration complete");
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
