import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">RSS & Highlights</h1>
      <p className="text-foreground/80">
        Personal knowledge hub: read RSS feeds and browse Kindle highlights by
        book.
      </p>
      {!session ? (
        <p className="text-sm text-foreground/70">
          <Link href="/auth/signin" className="underline underline-offset-4">
            Sign in
          </Link>{" "}
          to add feeds, read articles, and view your highlights.
        </p>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/rss"
            className="rounded-lg border border-black/10 dark:border-white/10 px-4 py-3 hover:bg-black/[.02] dark:hover:bg-white/[.06]"
          >
            <span className="font-medium">RSS</span>
            <p className="text-sm text-foreground/70 mt-1">
              Feeds and articles
            </p>
          </Link>
          <Link
            href="/highlights"
            className="rounded-lg border border-black/10 dark:border-white/10 px-4 py-3 hover:bg-black/[.02] dark:hover:bg-white/[.06]"
          >
            <span className="font-medium">Highlights</span>
            <p className="text-sm text-foreground/70 mt-1">
              Books and highlights
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}
