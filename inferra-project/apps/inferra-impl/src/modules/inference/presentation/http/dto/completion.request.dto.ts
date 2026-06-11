import { z } from "zod";
/** OpenAI-compatible text completion request; unsupported advanced parameters rejected explicitly. */
export const completionRequestDto = z
  .object({
    model: z.string().min(2).max(100),
    prompt: z.union([
      z.string().min(1).max(65536),
      z.array(z.string().min(1).max(16384)).min(1).max(4),
    ]),
    stream: z.boolean().default(false),
    max_tokens: z.number().int().min(1).max(8192).default(512),
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    stop: z
      .union([z.string().max(50), z.array(z.string().max(50)).max(4)])
      .optional(),
    suffix: z.string().max(512).optional(),
  })
  .strict();
export type CompletionRequestDto = z.infer<typeof completionRequestDto>;
/** Embeddings may be served only when upstream vLLM supports the selected model. */
export const embeddingsRequestDto = z
  .object({
    model: z.string().min(2).max(100),
    input: z.union([
      z.string().min(1).max(65536),
      z.array(z.string().min(1).max(16384)).min(1).max(64),
    ]),
    encoding_format: z.enum(["float", "base64"]).default("float"),
  })
  .strict();
export type EmbeddingsRequestDto = z.infer<typeof embeddingsRequestDto>;
