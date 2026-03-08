import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: articleId } = await params;
  if (!articleId) {
    return NextResponse.json({ error: "article id required" }, { status: 400 });
  }
  const body = await req.json();
  const isRead = Boolean(body.is_read);
  const article = await db.execute({
    sql: "SELECT a.id FROM articles a JOIN feeds f ON a.feed_id = f.id WHERE a.id = ? AND f.user_id = ?",
    args: [articleId, session.user.id],
  });
  if (article.rows.length === 0) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  await db.execute({
    sql: "UPDATE articles SET is_read = ? WHERE id = ?",
    args: [isRead ? 1 : 0, articleId],
  });
  return NextResponse.json({ is_read: isRead });
}
