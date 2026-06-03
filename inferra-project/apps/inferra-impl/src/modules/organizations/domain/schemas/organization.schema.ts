import { z } from "zod";
export const organizationSchema = z.object({
  id: z.uuid(),
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2).max(100),
});
export type OrganizationSchema = z.infer<typeof organizationSchema>;
