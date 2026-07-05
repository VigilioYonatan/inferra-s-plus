import { z } from "zod";
export const createBenchmarkRequestDto = z.object({
  model_id: z.uuid(),
  concurrency: z.number().int().min(1).max(8),
  requests: z.number().int().min(1).max(100),
  prompt: z.string().min(1).max(4096),
  max_tokens: z.number().int().min(1).max(256),
});
export type CreateBenchmarkRequestDto = z.infer<
  typeof createBenchmarkRequestDto
>;
