import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  if (!Number.isInteger(userId) || userId < 1) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await db.execute({
    sql: "SELECT totp_enabled FROM users WHERE id = ?",
    args: [userId],
  });
  if (row.rows.length === 0) {
    return NextResponse.json({ totpEnabled: false });
  }
  const r = row.rows[0] as unknown as { totp_enabled: number };
  return NextResponse.json({ totpEnabled: Boolean(r.totp_enabled) });
}
