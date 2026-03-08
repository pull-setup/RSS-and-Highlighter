import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { verifySignInToken } from "./auth-token";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = typeof credentials?.token === "string" ? credentials.token.trim() : null;
        if (token) {
          const payload = await verifySignInToken(token);
          if (!payload) return null;
          const row = await db.execute({
            sql: "SELECT id, email, name FROM users WHERE id = ? AND email = ?",
            args: [payload.userId, payload.email],
          });
          if (row.rows.length === 0) return null;
          const r = row.rows[0] as unknown as { id: number; email: string; name: string | null };
          return { id: String(r.id), email: r.email, name: r.name ?? "User" };
        }

        const email = process.env.AUTH_USER_EMAIL;
        const password = process.env.AUTH_PASSWORD;
        if (!email || !password) return null;
        if (
          credentials?.email !== email ||
          credentials?.password !== password
        ) {
          return null;
        }
        const name = process.env.AUTH_USER_NAME || "User";
        const row = await db.execute({
          sql: "SELECT id, totp_enabled FROM users WHERE email = ?",
          args: [email],
        });
        let userId: number;
        if (row.rows.length === 0) {
          const insert = await db.execute({
            sql: "INSERT INTO users (email, name) VALUES (?, ?)",
            args: [email, name],
          });
          userId = Number(insert.lastInsertRowid ?? 1);
        } else {
          const r = row.rows[0] as unknown as { id: number; totp_enabled: number };
          userId = r.id;
          if (r.totp_enabled) return null;
        }
        return { id: String(userId), email, name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  pages: { signIn: "/auth/signin" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.AUTH_SECRET,
});

declare module "next-auth" {
  interface Session {
    user: { id: string; email?: string | null; name?: string | null };
  }
}
