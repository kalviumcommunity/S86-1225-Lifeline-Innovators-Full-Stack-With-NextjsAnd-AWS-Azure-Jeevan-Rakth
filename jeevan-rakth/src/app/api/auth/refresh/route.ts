/**
 * Token Refresh Endpoint
 *
 * This endpoint handles refreshing expired access tokens using a valid refresh token.
 *
 * Flow:
 * 1. Client detects expired access token (401 response)
 * 2. Client calls this endpoint with refresh token in cookie
 * 3. Server validates refresh token and checks if revoked
 * 4. If valid, server issues new access token
 * 5. Optionally rotates refresh token for added security
 *
 * Security:
 * - Refresh token stored in HTTP-only cookie (not accessible to JavaScript)
 * - Refresh token path restricted to /api/auth/refresh
 * - Token rotation prevents reuse of stolen tokens
 * - Revoked tokens tracked in Redis
 */

import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  revokeRefreshToken,
  type TokenPayload,
} from "@/lib/jwt";
import {
  errorResponse,
  successResponse,
  ERROR_CODES,
} from "@/lib/responseHandler";

export async function POST(req: Request) {
  try {
    // Extract refresh token from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const refreshToken = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("refreshToken="))
      ?.split("=")[1];

    if (!refreshToken) {
      return errorResponse("Refresh token not found", {
        status: 401,
        code: ERROR_CODES.REFRESH_TOKEN_MISSING,
      });
    }

    // Verify refresh token (checks signature, expiry, and revocation)
    let decoded;
    try {
      decoded = await verifyRefreshToken(refreshToken);
    } catch (error) {
      return errorResponse(
        error instanceof Error ? error.message : "Invalid refresh token",
        { status: 403, code: ERROR_CODES.INVALID_REFRESH_TOKEN }
      );
    }

    // Create new token payload
    const tokenPayload: TokenPayload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // Generate new access token
    const newAccessToken = generateAccessToken(tokenPayload);

    // Optional: Rotate refresh token for added security
    // This prevents refresh token reuse if stolen
    const ENABLE_REFRESH_TOKEN_ROTATION =
      process.env.ENABLE_REFRESH_TOKEN_ROTATION === "true";

    let newRefreshToken = refreshToken;
    if (ENABLE_REFRESH_TOKEN_ROTATION) {
      // Revoke old refresh token
      await revokeRefreshToken(decoded.id, refreshToken);

      // Generate new refresh token
      newRefreshToken = generateRefreshToken(tokenPayload);
    }

    const res = successResponse("Token refreshed successfully", {
      accessToken: newAccessToken,
    });

    // Set new access token cookie (15 minutes)
    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    // Set new refresh token cookie if rotated
    if (ENABLE_REFRESH_TOKEN_ROTATION) {
      res.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return res;
  } catch (error) {
    console.error("Token refresh error:", error);
    return errorResponse("Failed to refresh token", {
      status: 500,
      code: ERROR_CODES.REFRESH_FAILED,
    });
  }
}
