import type { z } from "zod";
import { datasetSchema } from "../../../domain/schemas/dataset.schema";
export const createDatasetRequestDto = datasetSchema.pick({
  name: true,
  description: true,
  artifact_id: true,
});
export type CreateDatasetRequestDto = z.infer<typeof createDatasetRequestDto>;
export const updateDatasetRequestDto = createDatasetRequestDto
  .pick({ name: true, description: true })
  .partial()
  .refine((v) => Object.keys(v).length > 0);
export type UpdateDatasetRequestDto = z.infer<typeof updateDatasetRequestDto>;
