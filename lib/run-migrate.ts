/**
 * Loads .env.local before running migrate so TURSO_* env vars are set
 * when running: npm run db:migrate
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });
config({ path: path.join(__dirname, "..", ".env") });

await import("./migrate");
