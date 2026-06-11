import { z } from "zod";
export const deploymentSchema = z.object({
  id: z.uuid(),
  model_id: z.uuid(),
  runtime_profile: z.enum(["gpu-small", "gpu-medium", "gpu-large"]),
  status: z.enum(["configured", "disabled"]),
});
export type DeploymentSchema = z.infer<typeof deploymentSchema>;
