import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
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
  const book = bookRow.rows[0] as { id: number; title: string; author: string; asin: string | null };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/highlights" className="text-sm text-foreground/70 hover:underline">
          ← Books
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{book.title}</h1>
          <p className="text-foreground/70">{book.author}</p>
        </div>
      </div>
      <HighlightsView bookId={id} />
    </div>
  );
}
