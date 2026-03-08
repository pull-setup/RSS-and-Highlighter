import Link from "next/link";
import { auth } from "@/lib/auth";
import { HomeSections } from "./HomeSections";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-6">
      {!session ? (
        <p className="text-sm text-foreground/70">
          <Link href="/auth/signin" className="text-gray-500 underline underline-offset-4 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Sign in
          </Link>{" "}
          to add feeds, read articles, and view your highlights.
        </p>
      ) : (
        <HomeSections />
      )}
    </div>
  );
}
