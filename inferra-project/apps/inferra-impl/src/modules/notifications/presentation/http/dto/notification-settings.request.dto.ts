import { z } from "zod";
export const notificationSettingsRequestDto = z
  .object({ email_enabled: z.boolean() })
  .strict();
export type NotificationSettingsRequestDto = z.infer<
  typeof notificationSettingsRequestDto
>;
