import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
});

export const userUpdateSchema = userCreateSchema;

export type UserCreateInput = z.infer<typeof userCreateSchema>;
