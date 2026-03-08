import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSignInToken } from "@/lib/auth-token";
import { verify } from "otplib";

export async function POST(req: Request) {
  const body = await req.json();
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const totp = typeof body.totp === "string" ? body.totp.replace(/\s/g, "") : "";

  const envEmail = process.env.AUTH_USER_EMAIL;
  const envPassword = process.env.AUTH_PASSWORD;
  if (!envEmail || !envPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (email !== envEmail || password !== envPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const row = await db.execute({
    sql: "SELECT id, name, totp_secret, totp_enabled FROM users WHERE email = ?",
    args: [email],
  });
  let userId: number;
  let userName: string;
  if (row.rows.length === 0) {
    userName = process.env.AUTH_USER_NAME || "User";
    const insert = await db.execute({
      sql: "INSERT INTO users (email, name) VALUES (?, ?)",
      args: [email, userName],
    });
    userId = Number(insert.lastInsertRowid ?? 1);
  } else {
    const r = row.rows[0] as unknown as { id: number; name: string | null; totp_secret: string | null; totp_enabled: number };
    userId = r.id;
    userName = r.name ?? "User";
    if (r.totp_enabled && r.totp_secret) {
      if (!totp) {
        return NextResponse.json({ needTotp: true }, { status: 200 });
      }
      try {
        const result = await verify({ token: totp, secret: r.totp_secret });
        if (!result.valid) {
          return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
      }
    }
  }

  const token = await createSignInToken(userId, email);
  return NextResponse.json({ token, user: { id: String(userId), email, name: userName } });
}
