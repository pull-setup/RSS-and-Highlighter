#!/usr/bin/env node
"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { createClient } = require("@libsql/client");

const args = process.argv.slice(2);
const emailIdx = args.indexOf("--email");
const idIdx = args.indexOf("--id");

let targetEmail = null;
let targetId = null;
if (emailIdx !== -1 && args[emailIdx + 1]) {
  targetEmail = args[emailIdx + 1];
}
if (idIdx !== -1 && args[idIdx + 1]) {
  targetId = parseInt(args[idIdx + 1], 10);
}

if (!targetEmail && !targetId) {
  console.error("Usage: node scripts/disable-totp.cjs --email user@example.com");
  console.error("   or: node scripts/disable-totp.cjs --id 1");
  process.exit(1);
}

if (!process.env.TURSO_DATABASE_URL) {
  console.error("TURSO_DATABASE_URL is not set");
  process.exit(1);
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  let result;
  if (targetEmail) {
    result = await db.execute({
      sql: "UPDATE users SET totp_secret = NULL, totp_enabled = 0 WHERE email = ?",
      args: [targetEmail],
    });
  } else {
    result = await db.execute({
      sql: "UPDATE users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?",
      args: [targetId],
    });
  }

  const info = result.rowsAffected ?? 0;
  if (info > 0) {
    console.log(`TOTP disabled for ${targetEmail ?? `user id ${targetId}`}`);
  } else {
    console.log("No user found or TOTP was already disabled");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
