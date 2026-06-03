import { z } from "zod";

const role = z.enum(["admin", "operator", "developer", "analyst", "viewer"]);
export const addMemberRequestDto = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  role,
});
export type AddMemberRequestDto = z.infer<typeof addMemberRequestDto>;
export const setMemberRoleRequestDto = z.object({ role });
export type SetMemberRoleRequestDto = z.infer<typeof setMemberRoleRequestDto>;
