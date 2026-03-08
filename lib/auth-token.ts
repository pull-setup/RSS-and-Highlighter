import * as jose from "jose";

const TOKEN_EXPIRY = "5m";

export async function createSignInToken(userId: number, email: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters");
  }
  const key = new TextEncoder().encode(secret);
  return await new jose.SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(key);
}

export async function verifySignInToken(token: string): Promise<{ userId: number; email: string } | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  const key = new TextEncoder().encode(secret);
  try {
    const { payload } = await jose.jwtVerify(token, key);
    const userId = Number(payload.userId);
    const email = String(payload.email ?? "");
    if (!Number.isInteger(userId) || userId < 1 || !email) return null;
    return { userId, email };
  } catch {
    return null;
  }
}
