import { z } from "zod";
export const registerAccountRequestDto = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(12).max(128),
  display_name: z.string().max(120).optional(),
});
export type RegisterAccountRequestDto = z.infer<
  typeof registerAccountRequestDto
>;
