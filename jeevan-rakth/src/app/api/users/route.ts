import { Prisma } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ERROR_CODES,
  errorResponse,
  successResponse,
} from "@/lib/responseHandler";
import { userCreateSchema } from "@/lib/schemas/userSchema";
import { handleError } from "@/lib/errorHandler";
import redis, { DEFAULT_CACHE_TTL } from "@/lib/redis";
import { requirePermission } from "@/lib/rbac";
import { sanitizeInput, validateEmail } from "@/lib/sanitize";
// Uncomment to test loading/error states:
// import { simulateDelay, simulateError } from "@/lib/testUtils";

// GET /api/users?page=1&limit=10 → list users with pagination
// RBAC: Requires 'read' permission on 'users' resource
export const GET = requirePermission(
  "read",
  "users"
)(async (req: NextRequest) => {
  try {
    // 🧪 TEST LOADING STATE: Uncomment to add 3-second delay
    // await simulateDelay(3000);

    // 🧪 TEST ERROR STATE: Uncomment to simulate an error
    // simulateError('Database connection failed');

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
});

// POST /api/users → create a user
// RBAC: Requires 'create' permission on 'users' resource (admin only)
export const POST = requirePermission(
  "create",
  "users"
)(async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Sanitize all input fields before validation
    const sanitizedBody = {
      email: body.email ? sanitizeInput(body.email.trim()) : body.email,
      name: body.name ? sanitizeInput(body.name) : body.name,
      role: body.role ? sanitizeInput(body.role) : body.role,
    };

    // Additional email validation
    if (sanitizedBody.email && !validateEmail(sanitizedBody.email)) {
      return errorResponse("Invalid email format", {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
      });
    }

    const parsed = userCreateSchema.safeParse(sanitizedBody);
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
});
