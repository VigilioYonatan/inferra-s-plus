import { z } from "zod";
export const requestEmailOtpRequestDto = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
});
export type RequestEmailOtpRequestDto = z.infer<
  typeof requestEmailOtpRequestDto
>;
