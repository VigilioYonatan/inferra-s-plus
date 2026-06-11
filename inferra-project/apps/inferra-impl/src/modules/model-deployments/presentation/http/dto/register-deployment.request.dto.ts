import type { z } from "zod";
import { deploymentSchema } from "../../../domain/schemas/deployment.schema";
export const registerDeploymentRequestDto = deploymentSchema.pick({
  model_id: true,
  runtime_profile: true,
});
export type RegisterDeploymentRequestDto = z.infer<
  typeof registerDeploymentRequestDto
>;
