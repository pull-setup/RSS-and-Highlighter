import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AddBookForm } from "./AddBookForm";

export default async function NewBookPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/highlights/new");
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href="/highlights" className="text-sm text-foreground/70 hover:underline">
            ← Books
          </Link>
          <h1 className="text-2xl font-semibold">Add book</h1>
        </div>
        <AddBookForm />
      </div>
    </div>
  );
}
