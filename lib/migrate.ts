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

  console.log("Migration complete");
}

migrate().catch(console.error);
