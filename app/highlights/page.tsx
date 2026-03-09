import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StickyHeader } from "@/app/components/StickyHeader";
import { BooksList } from "./BooksList";

export const metadata: Metadata = {
  title: "Kindle Highlights",
};

export default async function HighlightsPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/highlights");
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <StickyHeader className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-center">Kindle Highlights</h1>
          <div className="flex items-center">
            <Link
              href="/highlights/new"
              className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Add book
            </Link>
          </div>
        </StickyHeader>
        <BooksList />
      </div>
    </div>
  );
}
