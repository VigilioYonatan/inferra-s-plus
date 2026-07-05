import type { z } from "zod";
import { experimentSchema } from "../../../domain/schemas/experiment.schema";
export const createExperimentRequestDto = experimentSchema;
export type CreateExperimentRequestDto = z.infer<
  typeof createExperimentRequestDto
>;
