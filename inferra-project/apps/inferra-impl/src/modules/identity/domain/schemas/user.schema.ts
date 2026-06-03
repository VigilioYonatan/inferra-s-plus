import { z } from "zod";
export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  display_name: z.string().nullable(),
});
export type UserSchema = z.infer<typeof userSchema>;
