import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import {
  ERROR_CODES,
  errorResponse,
  successResponse,
} from "@/lib/responseHandler";
import { userCreateSchema } from "@/lib/schemas/userSchema";
import { handleError } from "@/lib/errorHandler";
import redis, { DEFAULT_CACHE_TTL } from "@/lib/redis";
// Uncomment to test loading/error states:
// import { simulateDelay, simulateError } from "@/lib/testUtils";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// GET /api/users?page=1&limit=10 → list users with pagination
export async function GET(req: Request) {
  try {
    // 🧪 TEST LOADING STATE: Uncomment to add 3-second delay
    // await simulateDelay(3000);

    // 🧪 TEST ERROR STATE: Uncomment to simulate an error
    // simulateError('Database connection failed');
    // verify auth token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return errorResponse("Token missing", { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.warn("JWT verification failed:", err);
      return errorResponse("Invalid or expired token", { status: 403 });
    }

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `users:list:page:${page}:limit:${limit}`;

    // Try cache-aside: check Redis first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("Cache Hit", cacheKey);
        const parsed = JSON.parse(cached);
        return NextResponse.json(
          {
            success: true,
            message: "Users fetched successfully",
            data: parsed.data,
            meta: parsed.meta,
            timestamp: new Date().toISOString(),
          },
          { status: 200, headers: { "x-cache": "HIT" } }
        );
      }
    } catch (err) {
      console.warn("Redis GET failed", err);
    }

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      include: {
        ownedTeams: true,
        ownedProjects: true,
        teamMemberships: true,
      },
    });

    const totalUsers = await prisma.user.count();

    const meta = { page, limit, totalUsers };

    // Cache result (best-effort)
    try {
      await redis.set(
        cacheKey,
        JSON.stringify({ data: { users }, meta }),
        "EX",
        DEFAULT_CACHE_TTL
      );
      console.log("Cached", cacheKey);
    } catch (err) {
      console.warn("Redis SET failed", err);
    }

    return successResponse("Users fetched successfully", { users }, { meta });
  } catch (error: unknown) {
    return handleError(error, "GET /api/users", {
      status: 500,
      code: ERROR_CODES.USERS_FETCH_FAILED,
    });
  }
}

// POST /api/users → create a user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = userCreateSchema.safeParse(body);
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

    const user = await prisma.user.create({ data: parsed.data });

    // Invalidate list caches (best-effort). We delete any keys matching users:list*
    try {
      const keys = await redis.keys("users:list*");
      if (keys.length) {
        await redis.del(...keys);
        console.log("Invalidated user list cache", keys.length);
      }
    } catch (err) {
      console.warn("Redis DEL failed", err);
    }

    return successResponse("User created successfully", user, {
      status: 201,
    });
  } catch (error: unknown) {
    // Unique email constraint
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse("Email already exists", {
        status: 409,
        code: ERROR_CODES.EMAIL_CONFLICT,
      });
    }

    return handleError(error, "POST /api/users", {
      status: 500,
      code: ERROR_CODES.USERS_FETCH_FAILED,
    });
  }
}
