import { z } from "zod";
export const authenticatePasswordRequestDto = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
});
export type AuthenticatePasswordRequestDto = z.infer<
  typeof authenticatePasswordRequestDto
>;
