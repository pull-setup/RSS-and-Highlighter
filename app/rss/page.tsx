import { redirect } from "next/navigation";

export default function RssRedirect() {
  redirect("/feeds");
}
