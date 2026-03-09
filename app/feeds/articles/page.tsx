import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AllArticlesView } from "./AllArticlesView";

export const metadata: Metadata = {
  title: "All Articles",
};

export default async function AllArticlesPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/feeds/articles");
  }
  return <AllArticlesView />;
}
