import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await db.execute({
    sql: "SELECT id, title, author, asin, created_at FROM books WHERE user_id = ? ORDER BY title, author",
    args: [session.user.id],
  });
  const books = result.rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id,
      title: r.title,
      author: r.author,
      asin: r.asin ?? null,
      created_at: r.created_at,
    };
  });
  return NextResponse.json(books);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : null;
  const author = typeof body.author === "string" ? body.author.trim() : null;
  const asin = typeof body.asin === "string" ? body.asin.trim() || null : null;
  if (!title || !author) {
    return NextResponse.json(
      { error: "title and author required" },
      { status: 400 }
    );
  }
  try {
    const insert = await db.execute({
      sql: "INSERT INTO books (user_id, title, author, asin) VALUES (?, ?, ?, ?)",
      args: [session.user.id, title, author, asin],
    });
    const id = Number(insert.lastInsertRowid ?? 0);
    return NextResponse.json({
      id,
      title,
      author,
      asin,
      created_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Book already exists (same title and author)" },
      { status: 409 }
    );
  }
}
