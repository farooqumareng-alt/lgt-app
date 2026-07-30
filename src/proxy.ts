import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// Public even though they sit under the /wholesale prefix.
const PUBLIC_WHOLESALE_PATHS = ["/wholesale", "/wholesale/apply", "/wholesale/pending"];

// Optimistic, cookie-only checks (per Next.js auth guidance — Proxy must not hit the
// database). Full checks (e.g. wholesale approval status) belong in the DAL (`src/lib/dal.ts`).
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  if (pathname.startsWith("/account") && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (pathname.startsWith("/wholesale") && !PUBLIC_WHOLESALE_PATHS.includes(pathname)) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (role !== "WHOLESALER") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  if (pathname.startsWith("/admin") && (!session || role !== "ADMIN")) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/account/:path*", "/wholesale/:path*", "/admin/:path*"],
};
