import { z } from "zod";
export const modelSchema = z.object({
  id: z.uuid(),
  public_name: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z0-9_.:-]+$/),
  upstream_name: z.string().min(2).max(200),
  context_window: z.number().int().min(256).max(131072),
  enabled: z.boolean(),
});
export type ModelSchema = z.infer<typeof modelSchema>;
