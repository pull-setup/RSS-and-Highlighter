import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verify } from "otplib";

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
  const code = typeof body.code === "string" ? body.code.replace(/\s/g, "").trim() : "";
  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const row = await db.execute({
    sql: "SELECT totp_secret FROM users WHERE id = ? AND totp_enabled = 0",
    args: [userId],
  });
  if (row.rows.length === 0) {
    return NextResponse.json({ error: "No pending TOTP setup" }, { status: 400 });
  }
  const secret = (row.rows[0] as unknown as { totp_secret: string }).totp_secret;
  if (!secret) {
    return NextResponse.json({ error: "No pending TOTP setup" }, { status: 400 });
  }

  try {
    const result = await verify({ token: code, secret });
    if (!result.valid) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  await db.execute({
    sql: "UPDATE users SET totp_enabled = 1 WHERE id = ?",
    args: [userId],
  });

  return NextResponse.json({ success: true });
}
