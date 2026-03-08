import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: bookId } = await params;
  const bookRow = await db.execute({
    sql: "SELECT id FROM books WHERE id = ? AND user_id = ?",
    args: [bookId, session.user.id],
  });
  if (bookRow.rows.length === 0) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  const body = await req.json();
  const content = typeof body.content === "string" ? body.content.trim() : null;
  const location = typeof body.location === "string" ? body.location.trim() || null : null;
  const note = typeof body.note === "string" ? body.note.trim() || null : null;
  const highlightedAt = typeof body.highlighted_at === "string" ? body.highlighted_at.trim() || null : null;
  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }
  const insert = await db.execute({
    sql: "INSERT INTO highlights (book_id, content, location, highlighted_at, note) VALUES (?, ?, ?, ?, ?)",
    args: [bookId, content, location, highlightedAt, note],
  });
  const id = Number(insert.lastInsertRowid ?? 0);
  return NextResponse.json({
    id,
    content,
    location,
    highlighted_at: highlightedAt,
    note,
    created_at: new Date().toISOString(),
  });
}
