import { db } from "./db";

export async function isTotpEnabled(userId: string): Promise<boolean> {
  const id = Number(userId);
  if (!Number.isInteger(id) || id < 1) return false;
  try {
    const row = await db.execute({
      sql: "SELECT totp_enabled FROM users WHERE id = ?",
      args: [id],
    });
    if (row.rows.length === 0) return false;
    const r = row.rows[0] as unknown as { totp_enabled: number };
    return Boolean(r.totp_enabled);
  } catch {
    return false;
  }
}
