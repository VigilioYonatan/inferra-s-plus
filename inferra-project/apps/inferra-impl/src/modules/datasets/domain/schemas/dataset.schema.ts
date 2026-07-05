import { z } from "zod";
export const datasetSchema = z.object({
  id: z.uuid(),
  organization_id: z.uuid(),
  name: z.string().min(2).max(120),
  description: z.string().max(2000),
  artifact_id: z.uuid().nullable(),
  created_at: z.date(),
});
export type DatasetSchema = z.infer<typeof datasetSchema>;
