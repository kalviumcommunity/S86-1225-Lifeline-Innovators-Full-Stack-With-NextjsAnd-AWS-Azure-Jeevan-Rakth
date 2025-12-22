import { z } from "zod";
import {
  MAX_UPLOAD_BYTES,
  getAllowedMimePrefixes,
} from "@/lib/storage/presign";

const allowedPrefixes = getAllowedMimePrefixes();

export const uploadRequestSchema = z.object({
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename is too long"),
  fileType: z
    .string()
    .min(1, "File type is required")
    .refine(
      (value) => allowedPrefixes.some((prefix) => value.startsWith(prefix)),
      {
        message: "Unsupported file type",
      }
    ),
  fileSize: z
    .number({ invalid_type_error: "File size must be a number" })
    .int("File size must be an integer")
    .positive("File size must be positive")
    .max(MAX_UPLOAD_BYTES, "File too large"),
});
