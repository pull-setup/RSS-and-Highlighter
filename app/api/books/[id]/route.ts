import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const bookRow = await db.execute({
    sql: "SELECT id, title, author, asin, created_at FROM books WHERE id = ? AND user_id = ?",
    args: [id, session.user.id],
  });
  if (bookRow.rows.length === 0) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  const book = bookRow.rows[0] as Record<string, unknown>;
  const highlightsResult = await db.execute({
    sql: "SELECT id, content, location, highlighted_at, note, created_at FROM highlights WHERE book_id = ? ORDER BY highlighted_at ASC, id ASC",
    args: [id],
  });
  const highlights = highlightsResult.rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id,
      content: r.content,
      location: r.location ?? null,
      highlighted_at: r.highlighted_at ?? null,
      note: r.note ?? null,
      created_at: r.created_at,
    };
  });
  return NextResponse.json({
    book: {
      id: book.id,
      title: book.title,
      author: book.author,
      asin: book.asin ?? null,
      created_at: book.created_at,
    },
    highlights,
  });
}
