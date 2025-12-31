import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, type DecodedToken } from "@/lib/jwt";
import {
  handleCorsPreflightRequest,
  applyCorsHeaders,
} from "@/lib/securityHeaders";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  // Handle CORS preflight requests for all API routes
  if (req.method === "OPTIONS" && pathname.startsWith("/api")) {
    return handleCorsPreflightRequest(origin || undefined);
  }

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
      const response = NextResponse.json(
        { success: false, message: "Access token missing" },
        { status: 401 }
      );
      return applyCorsHeaders(response, origin || undefined);
    }

    try {
      const decoded = verifyAccessToken(token) as DecodedToken;

      // Role-based access control
      if (pathname.startsWith("/api/admin") && decoded.role !== "admin") {
        const response = NextResponse.json(
          { success: false, message: "Access denied" },
          { status: 403 }
        );
        return applyCorsHeaders(response, origin || undefined);
      }

      // Forward user context to downstream handlers
      const headers = new Headers(req.headers);
      headers.set("x-user-id", decoded.id);
      headers.set("x-user-email", decoded.email);
      headers.set("x-user-role", decoded.role);

      const response = NextResponse.next({ request: { headers } });
      return applyCorsHeaders(response, origin || undefined);
    } catch (error) {
      console.warn("Middleware JWT verification failed:", error);
      const response = NextResponse.json(
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
      return applyCorsHeaders(response, origin || undefined);
    }
  }

  // Apply CORS headers to all API responses
  if (pathname.startsWith("/api")) {
    const response = NextResponse.next();
    return applyCorsHeaders(response, origin || undefined);
  }

  return NextResponse.next();
}

/**
 * Ensures middleware runs for API routes and protected frontend routes
 */
export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/users/:path*"],
};
