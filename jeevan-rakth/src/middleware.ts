import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

type TokenPayload = jwt.JwtPayload & {
  email?: string;
  role?: string;
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /api/admin and /api/users
  if (
    !pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/users")
  ) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Token missing" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Role-based access control
    if (pathname.startsWith("/api/admin") && decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Forward user context to downstream handlers
    const headers = new Headers(req.headers);
    if (decoded.email) headers.set("x-user-email", decoded.email);
    if (decoded.role) headers.set("x-user-role", decoded.role);

    return NextResponse.next({ request: { headers } });
  } catch (error) {
    console.warn("Middleware JWT verification failed", error);
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 403 }
    );
  }
}

/**
 * Ensures middleware runs for all API routes
 */
export const config = {
  matcher: ["/api/:path*"],
};
