import { z } from "zod";
import { modelSchema } from "../../../domain/schemas/model.schema";
export const updateModelRequestDto = modelSchema
  .pick({ context_window: true, enabled: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0);
export type UpdateModelRequestDto = z.infer<typeof updateModelRequestDto>;
export const createModelVersionRequestDto = z.object({
  tag: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-zA-Z0-9_.-]+$/),
  upstream_name: z.string().min(2).max(200),
  sha256: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .nullable(),
});
export type CreateModelVersionRequestDto = z.infer<
  typeof createModelVersionRequestDto
>;
