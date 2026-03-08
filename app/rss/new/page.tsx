import { redirect } from "next/navigation";

export default function RssNewRedirect() {
  redirect("/feeds/new");
}
