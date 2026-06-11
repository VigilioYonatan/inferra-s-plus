import { z } from "zod";
export const requestModelImportDto = z
  .object({
    repository_id: z
      .string()
      .min(3)
      .max(200)
      .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/)
      .refine(
        (id) =>
          !id.includes("..") &&
          !id.startsWith(".") &&
          !id.includes("/.") &&
          !id.includes("\\"),
        { message: "Invalid repository path" },
      ),
  })
  .strict();
export type RequestModelImportDto = z.infer<typeof requestModelImportDto>;
