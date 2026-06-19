import { z } from "zod";
export const routingPolicySchema = z.object({
  name: z.string().min(3).max(120),
  model_id: z.uuid(),
  enabled: z.boolean(),
  concurrency_cap: z.number().int().min(1).max(128),
});
export type RoutingPolicySchema = z.infer<typeof routingPolicySchema>;
