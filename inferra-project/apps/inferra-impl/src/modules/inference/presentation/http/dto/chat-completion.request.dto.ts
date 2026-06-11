import { z } from "zod";
export const chatCompletionRequestDto = z
  .object({
    model: z.string().min(2).max(100),
    messages: z
      .array(
        z.object({
          role: z.enum(["system", "developer", "user", "assistant"]),
          content: z.string().min(1).max(65536),
        }),
      )
      .min(1)
      .max(100),
    stream: z.boolean().default(false),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().int().min(1).max(8192).default(512),
  })
  .strict();
export type ChatCompletionRequestDto = z.infer<typeof chatCompletionRequestDto>;
