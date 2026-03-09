import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { ChevronLeftIcon } from "@/app/components/ArticleIcons";
import { AddFeedForm } from "./AddFeedForm";

export const metadata: Metadata = {
  title: "Add feed",
};

export default async function NewFeedPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/feeds/new");
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-center">Add feed</h1>
          <div className="flex items-center">
            <Link
              href="/feeds"
              className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
              aria-label="Back to Feeds"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <AddFeedForm />
      </div>
    </div>
  );
}
