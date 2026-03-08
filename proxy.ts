import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isTotpEnabled } from "@/lib/check-totp";

const TOTP_SETUP_PATH = "/auth/totp";
const SIGNIN_PATH = "/auth/signin";

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/auth/signin") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!req.auth?.user?.id) {
    const signInUrl = new URL(SIGNIN_PATH, req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith("/auth/totp")) {
    return NextResponse.next();
  }

  const totpEnabled = await isTotpEnabled(req.auth.user.id);
  if (!totpEnabled) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "2FA setup required. Complete setup at /auth/totp" },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL(TOTP_SETUP_PATH, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
