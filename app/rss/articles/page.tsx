import { redirect } from "next/navigation";

export default function RssArticlesRedirect() {
  redirect("/feeds/articles");
}
