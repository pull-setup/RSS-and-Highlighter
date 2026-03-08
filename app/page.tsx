import Link from "next/link";
import { auth } from "@/lib/auth";
import { HomeSections } from "./HomeSections";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-6">
      {!session ? (
        <p className="text-sm text-foreground/70">
          <Link href="/auth/signin" className="text-muted underline underline-offset-4 hover:text-foreground">
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
