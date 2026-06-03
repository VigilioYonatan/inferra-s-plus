import { z } from "zod";
export const updateOrganizationRequestDto = z
  .object({ name: z.string().min(2).max(120) })
  .strict();
export type UpdateOrganizationRequestDto = z.infer<
  typeof updateOrganizationRequestDto
>;
