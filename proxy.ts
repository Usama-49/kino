import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Read and decrypt the NextAuth JWT token from incoming request cookies
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // 2. Identify target route categories
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/upload");

  // 3. Unauthenticated user trying to visit private pages -> Kick to /login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Already authenticated user trying to visit /login or /register -> Redirect to home /
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 5. Allow request to proceed as normal
  return NextResponse.next();
}

// 6. Matcher config: Run proxy.ts on protected and auth routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/upload",
    "/upload/:path*",
    "/login",
    "/register",
  ],
};
