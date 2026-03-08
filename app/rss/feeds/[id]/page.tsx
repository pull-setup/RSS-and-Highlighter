import { redirect } from "next/navigation";

export default async function RssFeedRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/feeds/${id}`);
}
