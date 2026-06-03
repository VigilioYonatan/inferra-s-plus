import { z } from "zod";
export const identityPublicResponseDto = z.object({
  ok: z.boolean(),
  user: z
    .object({
      id: z.uuid(),
      email: z.email(),
      display_name: z.string().nullable(),
    })
    .optional(),
});
export type IdentityPublicResponseDto = z.infer<
  typeof identityPublicResponseDto
>;
