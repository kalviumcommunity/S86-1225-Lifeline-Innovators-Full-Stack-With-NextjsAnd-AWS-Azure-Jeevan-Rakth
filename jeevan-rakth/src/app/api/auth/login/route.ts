import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
} from "@/lib/responseHandler";
import { loginSchema } from "@/lib/schemas/authSchema";
import { generateTokenPair, type TokenPayload } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation Error", {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return errorResponse("User not found", {
        status: 404,
        code: ERROR_CODES.USER_NOT_FOUND,
      });

    if (!user.password)
      return errorResponse("Invalid credentials", { status: 401 });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return errorResponse("Invalid credentials", { status: 401 });

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role ?? "user",
    };

    // Generate both access and refresh tokens
    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? "user",
    };

    const res = successResponse("Login successful", {
      user: safeUser,
      accessToken,
    });

    // Set access token cookie (15 minutes)
    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    // Set refresh token cookie (7 days) - more secure
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh", // Only sent to refresh endpoint
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Login failed", { status: 500 });
  }
}
