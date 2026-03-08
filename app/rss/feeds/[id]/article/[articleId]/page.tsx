import { redirect } from "next/navigation";

export default async function RssArticleRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; articleId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id, articleId } = await params;
  const { returnTo } = await searchParams;
  const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  redirect(`/feeds/${id}/article/${articleId}${query}`);
}
