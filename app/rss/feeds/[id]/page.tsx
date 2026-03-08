import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FeedView } from "./FeedView";

export default async function FeedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/rss");
  }
  const id = (await params).id;
  const row = await db.execute({
    sql: "SELECT id, url, title, description, site_url FROM feeds WHERE id = ? AND user_id = ?",
    args: [id, session.user.id],
  });
  if (row.rows.length === 0) notFound();
  const feed = row.rows[0] as unknown as {
    id: number;
    url: string;
    title: string;
    description: string | null;
    site_url: string | null;
  };
  return (
    <div className="flex flex-col gap-6">
      <FeedView feedId={String(feed.id)} feedTitle={feed.title} />
    </div>
  );
}
