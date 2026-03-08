import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
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
          sql: "SELECT id FROM users WHERE email = ?",
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
          userId = Number((row.rows[0] as { id: number }).id);
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
