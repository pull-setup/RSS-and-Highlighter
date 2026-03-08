import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RssPageClient } from "./RssPageClient";

export default async function RssPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/rss");
  }
  return <RssPageClient />;
}
