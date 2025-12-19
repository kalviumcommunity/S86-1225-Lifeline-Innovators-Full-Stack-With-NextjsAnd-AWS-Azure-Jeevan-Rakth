import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ERROR_CODES,
  errorResponse,
  successResponse,
} from "@/lib/responseHandler";
import { userUpdateSchema } from "@/lib/schemas/userSchema";
import redis from "@/lib/redis";

// GET /api/users/:id → get single user
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cacheKey = `users:${id}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("Cache Hit", cacheKey);
        return NextResponse.json(JSON.parse(cached), {
          status: 200,
          headers: { "x-cache": "HIT" },
        });
      }
    } catch (err) {
      console.warn("Redis GET failed", err);
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        ownedTeams: true,
        ownedProjects: true,
        assignedTasks: true,
        orders: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", {
        status: 404,
        code: ERROR_CODES.USER_NOT_FOUND,
      });
    }

    return successResponse("User retrieved successfully", user);
  } catch (error: unknown) {
    console.error("Failed to fetch user:", error);
    return errorResponse("Failed to fetch user", {
      status: 500,
      code: ERROR_CODES.USERS_FETCH_FAILED,
    });
  }
}

// PUT /api/users/:id → update user
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = userUpdateSchema.safeParse(body);
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

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: parsed.data,
    });

    // Invalidate cache for this user and user lists (best-effort)
    try {
      const userKey = `users:${id}`;
      const keys = await redis.keys("users:list*");
      const delTargets = keys.length ? [userKey, ...keys] : [userKey];
      await redis.del(...delTargets);
      console.log("Invalidated caches for user update", delTargets.length);
    } catch (err) {
      console.warn("Redis DEL failed", err);
    }

    return successResponse("User updated successfully", updatedUser);
  } catch (error: unknown) {
    console.error("Failed to update user:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return errorResponse("User not found", {
        status: 404,
        code: ERROR_CODES.USER_NOT_FOUND,
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse("Email already exists", {
        status: 409,
        code: ERROR_CODES.EMAIL_CONFLICT,
      });
    }

    return errorResponse("Failed to update user", {
      status: 500,
      code: ERROR_CODES.USERS_FETCH_FAILED,
    });
  }
}

// DELETE /api/users/:id → delete user
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    // Invalidate cache for this user and user lists (best-effort)
    try {
      const userKey = `users:${id}`;
      const keys = await redis.keys("users:list*");
      const delTargets = keys.length ? [userKey, ...keys] : [userKey];
      await redis.del(...delTargets);
      console.log("Invalidated caches for user delete", delTargets.length);
    } catch (err) {
      console.warn("Redis DEL failed", err);
    }

    return successResponse("User deleted successfully", {
      id: Number(id),
    });
  } catch (error: unknown) {
    console.error("Failed to delete user:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return errorResponse("User not found", {
        status: 404,
        code: ERROR_CODES.USER_NOT_FOUND,
      });
    }

    return errorResponse("Failed to delete user", {
      status: 500,
      code: ERROR_CODES.USERS_FETCH_FAILED,
    });
  }
}
