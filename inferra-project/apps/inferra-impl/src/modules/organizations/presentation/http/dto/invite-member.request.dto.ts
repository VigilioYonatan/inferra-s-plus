import { z } from "zod";
export const inviteMemberRequestDto = z.object({
  email: z.email().transform((v) => v.trim().toLowerCase()),
  role: z.enum(["admin", "operator", "developer", "analyst", "viewer"]),
});
export type InviteMemberRequestDto = z.infer<typeof inviteMemberRequestDto>;
export const acceptInvitationRequestDto = z.object({
  token: z.string().min(40).max(300),
});
export type AcceptInvitationRequestDto = z.infer<
  typeof acceptInvitationRequestDto
>;
