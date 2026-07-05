import { z } from "zod";
export const createPlaygroundSessionRequestDto = z
  .object({ title: z.string().min(2).max(120) })
  .strict();
export type CreatePlaygroundSessionRequestDto = z.infer<
  typeof createPlaygroundSessionRequestDto
>;
export const chatMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(65536),
  })
  .strict();
export const savePlaygroundSessionRequestDto = z
  .object({ messages: z.array(chatMessageSchema).max(200) })
  .strict();
export type SavePlaygroundSessionRequestDto = z.infer<
  typeof savePlaygroundSessionRequestDto
>;
