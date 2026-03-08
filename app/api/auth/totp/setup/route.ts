import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  if (!Number.isInteger(userId) || userId < 1) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await db.execute({
    sql: "SELECT email, totp_enabled FROM users WHERE id = ?",
    args: [userId],
  });
  if (row.rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const r = row.rows[0] as unknown as { email: string; totp_enabled: number };
  if (r.totp_enabled) {
    return NextResponse.json({ error: "TOTP already enabled" }, { status: 400 });
  }

  const secret = generateSecret();
  const otpauth = generateURI({ issuer: "ReedSync", label: r.email, secret });

  await db.execute({
    sql: "UPDATE users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?",
    args: [secret, userId],
  });

  const qrCode = await QRCode.toDataURL(otpauth, { width: 200, margin: 2 });

  return NextResponse.json({ secret, qrCode, otpauth });
}
