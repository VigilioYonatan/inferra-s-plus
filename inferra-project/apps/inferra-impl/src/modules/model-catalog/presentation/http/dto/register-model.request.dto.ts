import { z } from "zod";
import { modelSchema } from "../../../domain/schemas/model.schema";
export const registerModelRequestDto = modelSchema
  .pick({ public_name: true, upstream_name: true, context_window: true })
  .extend({ enabled: z.boolean().optional() });
export type RegisterModelRequestDto = z.infer<typeof registerModelRequestDto>;
