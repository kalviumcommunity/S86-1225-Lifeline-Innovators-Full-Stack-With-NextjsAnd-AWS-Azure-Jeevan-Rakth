import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/schemas/authSchema";
import {
  errorResponse,
  successResponse,
  ERROR_CODES,
} from "@/lib/responseHandler";
import redis from "@/lib/redis";
import { generateTokenPair, type TokenPayload } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const parsed = signupSchema.safeParse({ name, email, password });
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

    // prevent duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("Email already exists", {
        status: 409,
        code: ERROR_CODES.EMAIL_CONFLICT,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Invalidate user list caches (best-effort)
    try {
      const keys = await redis.keys("users:list*");
      if (keys.length) {
        await redis.del(...keys);
        console.log("Invalidated user list cache after signup", keys.length);
      }
    } catch (err) {
      console.warn("Redis DEL failed during signup cache invalidation", err);
    }

    const tokenPayload: TokenPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role ?? "user",
    };

    // Generate both access and refresh tokens
    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role ?? "user",
    };

    const res = successResponse(
      "Signup successful",
      { user: safeUser, accessToken },
      { status: 201 }
    );

    // Set access token cookie (15 minutes)
    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    // Set refresh token cookie (7 days)
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Signup error:", error);
    return errorResponse("Signup failed", { status: 500 });
  }
}
