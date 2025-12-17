import { prisma } from "@/lib/prisma";
import { taskCreateSchema } from "@/lib/schemas/taskSchema";
import {
  errorResponse,
  successResponse,
  ERROR_CODES,
} from "@/lib/responseHandler";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: { project: true, assignee: true },
      orderBy: { id: "desc" },
    });
    return successResponse("Tasks fetched successfully", { tasks });
  } catch (err: unknown) {
    console.error("Failed to fetch tasks:", err);
    return errorResponse("Failed to fetch tasks:", {
      status: 500,
      code: ERROR_CODES.UNKNOWN_ERROR,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = taskCreateSchema.safeParse(body);
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

    const created = await prisma.task.create({ data: parsed.data });
    return successResponse("Task created successfully", created, {
      status: 201,
    });
  } catch (err: unknown) {
    console.error("Failed to create task:", err);
    const maybe = err as { code?: string };
    if (maybe.code === "P2002") {
      return errorResponse("Unique constraint failed", {
        status: 409,
        code: ERROR_CODES.UNKNOWN_ERROR,
      });
    }
    return errorResponse("Failed to create task", {
      status: 500,
      code: ERROR_CODES.UNKNOWN_ERROR,
    });
  }
}
