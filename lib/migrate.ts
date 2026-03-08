import { db } from "./db";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Create .env.local with TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN if using Turso Cloud), then run: npm run db:migrate"
    );
  }
  const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await db.execute(statement);
    } catch (err) {
      console.error("Statement failed:", statement.slice(0, 80) + "...");
      throw err;
    }
  }

  // Add is_bookmarked column if it doesn't exist (for existing databases)
  try {
    await db.execute("ALTER TABLE articles ADD COLUMN is_bookmarked INTEGER NOT NULL DEFAULT 0");
    console.log("Added is_bookmarked column to articles");
  } catch {
    // Column may already exist (duplicate column name)
  }

  console.log("Migration complete");
}

migrate().catch(console.error);
