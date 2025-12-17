import { z } from "zod";

export const orderCreateSchema = z.object({
  userId: z.preprocess((v) => Number(v), z.number()),
  productId: z.preprocess((v) => Number(v), z.number()),
  quantity: z.preprocess(
    (v) => (v === undefined ? 1 : Number(v)),
    z.number().min(1)
  ),
  paymentProvider: z.string().optional(),
  paymentReference: z.string().optional(),
  simulateFailure: z.boolean().optional(),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
