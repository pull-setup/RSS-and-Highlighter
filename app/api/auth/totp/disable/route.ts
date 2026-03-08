import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  if (!Number.isInteger(userId) || userId < 1) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const password = typeof body.password === "string" ? body.password : "";

  const envEmail = process.env.AUTH_USER_EMAIL;
  const envPassword = process.env.AUTH_PASSWORD;
  if (!envEmail || !envPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  if (password !== envPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const row = await db.execute({
    sql: "SELECT id FROM users WHERE id = ? AND email = ?",
    args: [userId, envEmail],
  });
  if (row.rows.length === 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.execute({
    sql: "UPDATE users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?",
    args: [userId],
  });

  return NextResponse.json({ success: true });
}
