import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AllArticlesView } from "./AllArticlesView";

export default async function AllArticlesPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/rss/articles");
  }
  return <AllArticlesView />;
}
