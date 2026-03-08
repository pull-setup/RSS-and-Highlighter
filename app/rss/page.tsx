import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FeedsList } from "./FeedsList";

export default async function RssPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/rss");
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">RSS Feeds</h1>
        <Link
          href="/rss/new"
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Add feed
        </Link>
      </div>
      <FeedsList />
    </div>
  );
}
