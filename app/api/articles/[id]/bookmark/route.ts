import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: articleId } = await params;
  if (!articleId) {
    return NextResponse.json({ error: "Article id required" }, { status: 400 });
  }
  let body: { is_bookmarked?: boolean };
  try {
    body = await _req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const isBookmarked = body.is_bookmarked === true;

  const row = await db.execute({
    sql: "SELECT a.id FROM articles a JOIN feeds f ON a.feed_id = f.id WHERE a.id = ? AND f.user_id = ?",
    args: [articleId, session.user.id],
  });
  if (row.rows.length === 0) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  await db.execute({
    sql: "UPDATE articles SET is_bookmarked = ? WHERE id = ?",
    args: [isBookmarked ? 1 : 0, articleId],
  });
  return NextResponse.json({ ok: true });
}
