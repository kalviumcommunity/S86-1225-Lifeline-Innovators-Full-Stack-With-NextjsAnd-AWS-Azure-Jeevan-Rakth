import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ERROR_CODES,
  errorResponse,
  successResponse,
} from "@/lib/responseHandler";

// GET /api/users/:id → get single user
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(params.id) },
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
  } catch (error) {
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    if (!body.name || !body.email) {
      return errorResponse("Name and email are required", {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(params.id) },
      data: {
        name: body.name,
        email: body.email,
      },
    });

    return successResponse("User updated successfully", updatedUser);
  } catch (error) {
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: Number(params.id) },
    });

    return successResponse("User deleted successfully", {
      id: Number(params.id),
    });
  } catch (error) {
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
