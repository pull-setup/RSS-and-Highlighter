# Build & run steps (manual)

## Prerequisites

- Node.js 18+
- A [Turso](https://turso.tech) account (or local libSQL for dev)

## 1. Install dependencies

```bash
cd rss-n-highlighter
npm install
```

## 2. Turso database

Create a database and get credentials:

- **Turso Cloud**: [Turso dashboard](https://turso.tech/app) → Create database → copy **Database URL** and **Auth token** (for remote).
- **Local**: Use `libsql://localhost:2020` and no auth token (e.g. [Turso CLI](https://docs.turso.tech/cli) or [libsql server](https://github.com/tursodatabase/libsql)).

## 3. Environment variables

Copy the example and fill in values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `TURSO_DATABASE_URL` | Yes | Turso DB URL (e.g. `libsql://your-db-username.turso.io`) |
| `TURSO_AUTH_TOKEN` | For Turso Cloud | Auth token (leave empty for local) |
| `AUTH_SECRET` | Yes | Random string for JWT signing (e.g. `openssl rand -base64 32`) |
| `AUTH_USER_EMAIL` | Yes | Email you use to sign in (any value) |
| `AUTH_PASSWORD` | Yes | Password you use to sign in |
| `AUTH_USER_NAME` | No | Display name (default: "User") |

## 4. Run database migration

Creates/updates tables (users, feeds, articles, books, highlights):

```bash
npm run db:migrate
```

## 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with `AUTH_USER_EMAIL` and `AUTH_PASSWORD`.

## 6. Production build (optional)

```bash
npm run build
npm start
```

Set the same env vars in your hosting (Vercel, Railway, etc.). Run `npm run db:migrate` once against your production Turso DB (e.g. from CI or a one-off script).

**If `npm run build` or `next` fails** (e.g. `Cannot find module` inside `node_modules`), try a clean install:

```bash
rm -rf node_modules .next
npm install
npm run build
```

---

## Quick reference

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run db:migrate` | Apply schema to Turso |
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Run production server |

## Features

- **RSS**: Add feed URL → articles are fetched and stored; mark read/unread; refresh feed to get new items.
- **Highlights**: Add books (title, author), then add highlights per book. View all highlights grouped by book.
