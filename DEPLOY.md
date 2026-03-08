# Deploy to Vercel

## 0. What to ignore & env files

**.gitignore** already excludes:

- `node_modules/`, `.next/`, `out/`, `build/`
- `.env`, `.env*.local` (all env files with secrets)
- `.vercel/`, `.DS_Store`, `*.tsbuildinfo`, debug logs

**Env / “variable files”:**

- **Do not commit** `.env` or `.env.local` (they hold secrets).
- **Do commit** `.env.example`: it’s a template with fake/empty values. Others (and you on a new clone) copy it and fill in real values locally:
  ```bash
  cp .env.example .env.local
  # edit .env.local with real TURSO_*, AUTH_*, etc.
  ```
- For **production** (e.g. Vercel), set the same variables in the host’s “Environment Variables” UI; never put production secrets in the repo.

## 1. Push to GitHub

Create a repo on GitHub (e.g. `RSS-and-Highlighter` or `rss-n-highlighter`), then:

```bash
git init
git add .
git status   # ensure .env.local is not listed
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

If you use SSH and get "Permission denied (publickey)", either add your SSH key in GitHub or switch to HTTPS:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR-REPO-NAME.git
```

If you have GPG commit signing enabled but don’t want it for this repo:

```bash
git config commit.gpgsign false
```

If the remote already has a README/license, either pull first (`git pull origin main --allow-unrelated-histories`) or force push (`git push -u origin main --force`) if you’re fine replacing remote.

## 2. Create a production Turso database

In [Turso dashboard](https://turso.tech/app): create a **new** database for production (or reuse one). Copy:

- **Database URL** (e.g. `libsql://your-db-username.turso.io`)
- **Auth token** (for that database)

## 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub).
2. **Add New** → **Project** → import your GitHub repo.
3. Leave **Framework Preset** as Next.js and **Root Directory** as `.`
4. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   |------|--------|
   | `TURSO_DATABASE_URL` | Your production Turso URL |
   | `TURSO_AUTH_TOKEN` | Your Turso auth token |
   | `AUTH_SECRET` | A long random string (e.g. `openssl rand -base64 32`) |
   | `AUTH_USER_EMAIL` | Email you’ll use to sign in |
   | `AUTH_PASSWORD` | Password you’ll use to sign in |
   | `AUTH_USER_NAME` | Your display name (optional) |

   Add them for **Production** (and optionally Preview if you want).

5. Click **Deploy**. Wait for the build to finish.

## 4. Run migrations on the production database

Vercel doesn’t run the migrate script. Run it once from your machine against the **production** Turso DB:

```bash
TURSO_DATABASE_URL="libsql://your-PROD-db.turso.io" TURSO_AUTH_TOKEN="your-PROD-token" npm run db:migrate
```

Use the same URL and token you added in Vercel env vars.

## 5. Set the correct auth URL (if needed)

NextAuth needs to know the production URL. With Vercel, the default is usually fine. If sign-in redirects break, add in Vercel env:

- `NEXTAUTH_URL` = `https://your-app.vercel.app`

(Replace with your real Vercel URL.)

## 6. Done

Open `https://your-project.vercel.app`, sign in with `AUTH_USER_EMAIL` / `AUTH_PASSWORD`, and use the app.

---

**Summary**

- Push to GitHub → Vercel “Add Project” → set env vars → Deploy.
- Run `npm run db:migrate` once with production `TURSO_*` so the prod DB has tables.
- Set `NEXTAUTH_URL` in Vercel only if sign-in redirects fail.
