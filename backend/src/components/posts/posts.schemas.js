import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().max(120).optional(),
  body: z.string().min(1).max(2000),
  pinned: z.boolean().optional(),
});

export const listPostsQuerySchema = z.object({
  pinnedFirst: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});
