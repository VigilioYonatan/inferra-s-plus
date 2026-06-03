import type { z } from "zod";
import { organizationSchema } from "../../../domain/schemas/organization.schema";
export const registerOrganizationRequestDto = organizationSchema.pick({
  slug: true,
  name: true,
});
export type RegisterOrganizationRequestDto = z.infer<
  typeof registerOrganizationRequestDto
>;
