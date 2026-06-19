import type { z } from "zod";
import { routingPolicySchema } from "../../../domain/schemas/routing-policy.schema";
export const createRoutingPolicyRequestDto = routingPolicySchema;
export type CreateRoutingPolicyRequestDto = z.infer<
  typeof createRoutingPolicyRequestDto
>;
export const updateRoutingPolicyRequestDto = routingPolicySchema
  .pick({ name: true, enabled: true, concurrency_cap: true })
  .partial()
  .refine((v) => Object.keys(v).length > 0);
export type UpdateRoutingPolicyRequestDto = z.infer<
  typeof updateRoutingPolicyRequestDto
>;
