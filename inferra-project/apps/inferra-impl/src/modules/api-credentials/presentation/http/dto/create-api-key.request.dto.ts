import { z } from "zod";
export const createApiKeyRequestDto = z.object({
  name: z.string().min(2).max(80),
  scopes: z
    .array(z.enum(["inference:invoke", "models:read"]))
    .min(1)
    .default(["inference:invoke"]),
});
export type CreateApiKeyRequestDto = z.infer<typeof createApiKeyRequestDto>;
