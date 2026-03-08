import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "@/app/components/ArticleIcons";
import { db } from "@/lib/db";
import { StickyHeader } from "@/app/components/StickyHeader";
import { HighlightsView } from "./HighlightsView";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/highlights");
  }
  const id = (await params).id;
  const bookRow = await db.execute({
    sql: "SELECT id, title, author, asin FROM books WHERE id = ? AND user_id = ?",
    args: [id, session.user.id],
  });
  if (bookRow.rows.length === 0) notFound();
  const book = bookRow.rows[0] as unknown as { id: number; title: string; author: string; asin: string | null };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <StickyHeader className="flex flex-col gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-center">{book.title}</h1>
            <p className="text-foreground/70">{book.author}</p>
          </div>
          <div className="flex items-center">
            <Link
              href="/highlights"
              className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground sm:min-h-0 sm:min-w-0 sm:py-1"
              aria-label="Back to Books"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </div>
        </StickyHeader>
        <HighlightsView bookId={id} />
      </div>
    </div>
  );
}
