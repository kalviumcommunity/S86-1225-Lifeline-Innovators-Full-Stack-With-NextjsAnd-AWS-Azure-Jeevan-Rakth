import { uploadRequestSchema } from "@/lib/schemas/fileUploadSchema";
import { generatePresignedUpload } from "@/lib/storage/presign";
import {
  errorResponse,
  successResponse,
  ERROR_CODES,
} from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const parsed = uploadRequestSchema.safeParse(payload);

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

    const presign = await generatePresignedUpload(parsed.data);

    return successResponse("Upload URL generated", presign, {
      status: 201,
    });
  } catch (error) {
    return handleError(error, "POST /api/upload", {
      status: 500,
      code: ERROR_CODES.UNKNOWN_ERROR,
    });
  }
}
