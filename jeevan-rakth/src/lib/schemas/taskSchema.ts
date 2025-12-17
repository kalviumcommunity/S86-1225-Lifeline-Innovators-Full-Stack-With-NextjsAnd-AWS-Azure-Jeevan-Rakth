import { z } from "zod";

export const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["BACKLOG", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  projectId: z.preprocess((v) => Number(v), z.number()),
  assigneeId: z.preprocess((v) => Number(v), z.number()),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
