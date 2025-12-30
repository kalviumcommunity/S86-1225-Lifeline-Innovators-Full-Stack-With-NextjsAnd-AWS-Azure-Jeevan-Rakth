import { NextResponse } from "next/server";
import { revokeRefreshToken, verifyRefreshToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    // Get refresh token from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const refreshToken = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("refreshToken="))
      ?.split("=")[1];

    // Revoke refresh token if present
    if (refreshToken) {
      try {
        const decoded = await verifyRefreshToken(refreshToken);
        await revokeRefreshToken(decoded.id, refreshToken);
      } catch (error) {
        // Token might be expired or invalid, continue with logout
        console.log("Refresh token verification failed during logout:", error);
      }
    }

    const res = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear both access and refresh token cookies
    res.cookies.set("accessToken", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });
    res.cookies.set("refreshToken", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/api/auth/refresh",
    });

    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}
