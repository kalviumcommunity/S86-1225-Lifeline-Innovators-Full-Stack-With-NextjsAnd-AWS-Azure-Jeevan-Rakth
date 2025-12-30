/**
 * Get Current User Endpoint
 *
 * Returns the currently authenticated user's information based on
 * the access token in the cookie. Used to restore auth state on page load.
 */

import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  successResponse,
  ERROR_CODES,
} from "@/lib/responseHandler";

export async function GET(req: Request) {
  try {
    // Extract access token from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const accessToken = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    if (!accessToken) {
      return errorResponse("Not authenticated", {
        status: 401,
        code: ERROR_CODES.NOT_AUTHENTICATED,
      });
    }

    // Verify access token
    let decoded;
    try {
      decoded = verifyAccessToken(accessToken);
    } catch (error) {
      return errorResponse(
        error instanceof Error ? error.message : "Invalid access token",
        { status: 401, code: ERROR_CODES.TOKEN_EXPIRED }
      );
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", {
        status: 404,
        code: ERROR_CODES.USER_NOT_FOUND,
      });
    }

    return successResponse("User retrieved successfully", { user });
  } catch (error) {
    console.error("Get current user error:", error);
    return errorResponse("Failed to get user", { status: 500 });
  }
}
