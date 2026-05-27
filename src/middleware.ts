import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const isRoot = request.nextUrl.pathname === "/";
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isAdmin = request.nextUrl.pathname.startsWith("/admin");

  if (!token && (isDashboard || isAdmin))
    return NextResponse.redirect(new URL("/", request.url));

  if (token && isAdmin && role !== "admin")
    return NextResponse.redirect(new URL("/dashboard", request.url));

  if (token && isRoot)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*"],
};
