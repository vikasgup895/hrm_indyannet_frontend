import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // 🔒 If logged in and trying to access public routes → go to dashboard
  if (token && (pathname === "/" || pathname.startsWith("/login"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 🔐 If NOT logged in and trying to access private routes → go to login
  const isPrivate =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/leave") ||
    pathname.startsWith("/payroll") ||
    pathname.startsWith("/performance") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings");

  if (!token && isPrivate) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Default: allow
  return NextResponse.next();
}

// ⚙️ Apply middleware only where needed (avoids intercepting Next.js assets)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
