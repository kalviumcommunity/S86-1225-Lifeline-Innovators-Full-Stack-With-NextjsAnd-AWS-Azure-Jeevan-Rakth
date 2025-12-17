import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  code: z.string().min(1, "Project code is required"),
  ownerId: z.preprocess((v) => Number(v), z.number()),
  teamId: z.preprocess((v) => Number(v), z.number()),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
