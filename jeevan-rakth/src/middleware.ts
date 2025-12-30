import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, type DecodedToken } from "@/lib/jwt";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes (accessible without authentication)
  if (pathname.startsWith("/login") || pathname === "/") {
    return NextResponse.next();
  }

  // Protected frontend routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      verifyAccessToken(token);
      return NextResponse.next();
    } catch {
      // Access token expired or invalid - redirect to login
      // Client should attempt refresh before redirecting
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // API route protection
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Access token missing" },
        { status: 401 }
      );
    }

    try {
      const decoded = verifyAccessToken(token) as DecodedToken;

      // Role-based access control
      if (pathname.startsWith("/api/admin") && decoded.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Access denied" },
          { status: 403 }
        );
      }

      // Forward user context to downstream handlers
      const headers = new Headers(req.headers);
      headers.set("x-user-id", decoded.id);
      headers.set("x-user-email", decoded.email);
      headers.set("x-user-role", decoded.role);

      return NextResponse.next({ request: { headers } });
    } catch (error) {
      console.warn("Middleware JWT verification failed:", error);
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Invalid or expired access token",
          code: "TOKEN_EXPIRED",
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

/**
 * Ensures middleware runs for API routes and protected frontend routes
 */
export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/users/:path*"],
};
