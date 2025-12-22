import { z } from "zod";

export const fileCreateSchema = z.object({
  name: z.string().min(1, "File name is required").max(255, "Name too long"),
  url: z.string().url("File URL must be a valid URL"),
  mimeType: z.string().min(1, "MIME type is required"),
  sizeBytes: z
    .number({ invalid_type_error: "sizeBytes must be a number" })
    .int("sizeBytes must be an integer")
    .positive("sizeBytes must be positive"),
  storageKey: z
    .string()
    .min(1, "storageKey is required")
    .max(512, "storageKey is too long"),
  provider: z.enum(["aws", "azure"], {
    errorMap: () => ({ message: "provider must be aws or azure" }),
  }),
  uploaderId: z
    .number({ invalid_type_error: "uploaderId must be a number" })
    .int("uploaderId must be an integer")
    .positive("uploaderId must be positive")
    .optional(),
});
