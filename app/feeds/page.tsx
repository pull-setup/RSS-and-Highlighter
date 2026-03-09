import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FeedsPageClient } from "./FeedsPageClient";

export const metadata: Metadata = {
  title: "RSS Feeds",
};

export default async function FeedsPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/feeds");
  }
  return <FeedsPageClient />;
}
