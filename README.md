# RSS & Highlights

Personal knowledge hub: **RSS reader** (add feeds, read articles, mark read/unread) and **Kindle highlights** (view highlights by book).

- **Stack**: Next.js 14 (app router), Tailwind CSS, Turso (SQLite), NextAuth.js (credentials).
- **Manual setup**: See **[BUILD.md](./BUILD.md)** for install, env vars, migration, and run steps.

## Quick start

```bash
npm install
cp .env.example .env.local   # then edit with Turso URL, AUTH_* vars
npm run db:migrate
npm run dev
```

Open http://localhost:3000 and sign in with the email/password you set in `.env.local`.
