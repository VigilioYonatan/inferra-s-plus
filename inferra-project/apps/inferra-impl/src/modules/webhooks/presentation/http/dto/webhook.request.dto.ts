import { z } from "zod";
export const createWebhookRequestDto = z
  .object({ name: z.string().min(2).max(120), url: z.url().max(2048) })
  .strict();
export type CreateWebhookRequestDto = z.infer<typeof createWebhookRequestDto>;
export const updateWebhookRequestDto = z
  .object({ enabled: z.boolean() })
  .strict();
export type UpdateWebhookRequestDto = z.infer<typeof updateWebhookRequestDto>;
