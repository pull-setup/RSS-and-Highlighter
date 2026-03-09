import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HighlightsPageClient } from "./HighlightsPageClient";

export const metadata: Metadata = {
  title: "Kindle Highlights",
};

export default async function HighlightsPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/highlights");
  }
  return <HighlightsPageClient />;
}
