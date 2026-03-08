# RSS & Highlights

Personal knowledge hub: RSS reader (add feeds, read articles in-app, mark read/unread) and Kindle highlights (books + highlights).

**Stack:** Next.js (app router), Tailwind, Turso, NextAuth (credentials).

## Docs

- **[BUILD.md](./BUILD.md)** — install, env, migrate, run locally
- **[DEPLOY.md](./DEPLOY.md)** — deploy to Vercel, env handling, what to gitignore

## Quick start

```bash
npm install
cp .env.example .env.local   # edit: TURSO_*, AUTH_SECRET, AUTH_USER_EMAIL, AUTH_PASSWORD
npm run db:migrate
npm run dev
```

Open http://localhost:3000 and sign in with the credentials from `.env.local`.
