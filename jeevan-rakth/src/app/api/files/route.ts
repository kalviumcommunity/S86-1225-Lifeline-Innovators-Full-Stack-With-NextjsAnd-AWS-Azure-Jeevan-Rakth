import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errorHandler";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
} from "@/lib/responseHandler";
import { fileCreateSchema } from "@/lib/schemas/fileSchema";
import type { Prisma, PrismaClient } from "@prisma/client";

type PrismaWithFile = PrismaClient & { file: Prisma.FileDelegate };

const prismaFile = (prisma as PrismaWithFile).file;

export async function GET() {
  try {
    const files = await prismaFile.findMany({
      orderBy: { uploadedAt: "desc" },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return successResponse("Files fetched", files);
  } catch (error) {
    return handleError(error, "GET /api/files", {
      status: 500,
      code: ERROR_CODES.UNKNOWN_ERROR,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = fileCreateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const file = await prismaFile.create({
      data: parsed.data,
    });

    return successResponse("File metadata stored", file, {
      status: 201,
    });
  } catch (error) {
    return handleError(error, "POST /api/files", {
      status: 500,
      code: ERROR_CODES.UNKNOWN_ERROR,
    });
  }
}
