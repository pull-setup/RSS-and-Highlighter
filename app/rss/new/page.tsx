import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AddFeedForm } from "./AddFeedForm";

export default async function NewFeedPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/rss/new");
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href="/rss" className="text-sm text-gray-500 hover:text-gray-700 hover:underline dark:text-gray-400 dark:hover:text-gray-300">
            ← Feeds
          </Link>
          <h1 className="text-2xl font-semibold">Add feed</h1>
        </div>
        <AddFeedForm />
      </div>
    </div>
  );
}
