import Link from "next/link";
import { auth } from "@/lib/auth";
import { HomeSections } from "./HomeSections";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">RSS & Highlights</h1>
        <p className="text-sm text-foreground/70">
          Personal knowledge hub: read RSS feeds and browse Kindle highlights by book.
        </p>
      </div>
      {!session ? (
        <p className="text-sm text-foreground/70">
          <Link href="/auth/signin" className="underline underline-offset-4">
            Sign in
          </Link>{" "}
          to add feeds, read articles, and view your highlights.
        </p>
      ) : (
        <HomeSections />
      )}
    </div>
  );
}
