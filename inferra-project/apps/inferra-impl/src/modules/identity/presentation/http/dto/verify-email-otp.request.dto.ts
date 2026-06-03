import { z } from "zod";
export const verifyEmailOtpRequestDto = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  code: z.string().regex(/^\d{6}$/),
});
export type VerifyEmailOtpRequestDto = z.infer<typeof verifyEmailOtpRequestDto>;
