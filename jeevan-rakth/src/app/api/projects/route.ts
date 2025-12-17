import { prisma } from "@/lib/prisma";
import { projectCreateSchema } from "@/lib/schemas/projectSchema";
import {
  errorResponse,
  successResponse,
  ERROR_CODES,
} from "@/lib/responseHandler";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      owner: true,
      team: true,
    },
  });
  return successResponse("Projects fetched successfully", { projects });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = projectCreateSchema.safeParse(body);
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

    const project = await prisma.project.create({ data: parsed.data });
    return successResponse("Project created successfully", project, {
      status: 201,
    });
  } catch (err: unknown) {
    console.error("Failed to create project:", err);
    return errorResponse("Failed to create project", {
      status: 500,
      code: ERROR_CODES.UNKNOWN_ERROR,
    });
  }
}
