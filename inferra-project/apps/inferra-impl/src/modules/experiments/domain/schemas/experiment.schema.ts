import { z } from "zod";
export const experimentSchema = z
  .object({
    name: z.string().min(3).max(120),
    baseline_benchmark_id: z.uuid(),
    candidate_benchmark_id: z.uuid(),
  })
  .refine((v) => v.baseline_benchmark_id !== v.candidate_benchmark_id, {
    message: "Choose two different benchmark runs",
  });
export type ExperimentSchema = z.infer<typeof experimentSchema>;
