import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BooksList } from "./BooksList";

export default async function HighlightsPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/highlights");
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Kindle Highlights</h1>
          <Link
            href="/highlights/new"
            className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Add book
          </Link>
        </div>
        <BooksList />
      </div>
    </div>
  );
}
