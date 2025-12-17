import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ERROR_CODES,
  errorResponse,
  successResponse,
} from "@/lib/responseHandler";
import { userCreateSchema } from "@/lib/schemas/userSchema";

// GET /api/users?page=1&limit=10 → list users with pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

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

    return successResponse(
      "Users fetched successfully",
      { users },
      {
        meta: { page, limit, totalUsers },
      }
    );
  } catch (error: unknown) {
    console.error("Failed to fetch users:", error);
    return errorResponse("Failed to fetch users", {
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

    return successResponse("User created successfully", user, {
      status: 201,
    });
  } catch (error: unknown) {
    console.error("Failed to create user:", error);
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

    return errorResponse("Failed to create user", {
      status: 500,
      code: ERROR_CODES.USERS_FETCH_FAILED,
    });
  }
}
