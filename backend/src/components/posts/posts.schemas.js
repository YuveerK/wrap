import { z } from "zod";

const postCategorySchema = z.enum([
  "NOTICES",
  "SAFETY",
  "EVENTS",
  "LOST_AND_FOUND",
  "RECOMMENDATIONS",
]);

export const createPostBodySchema = z.object({
  title: z.string().max(120).optional(),
  body: z.string().min(1).max(2000),
  pinned: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  category: postCategorySchema.optional().default("NOTICES"),
  addressText: z.string().max(200).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const createPostSchema = z.object({
  title: z.string().max(120).optional(),
  body: z.string().min(1).max(2000),
  pinned: z.boolean().optional(),
  category: postCategorySchema.optional().default("NOTICES"),
  addressText: z.string().max(200).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const listPostsQuerySchema = z.object({
  pinnedFirst: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  category: postCategorySchema.optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1).max(1000),
  parentId: z.coerce.number().int().positive().optional(),
});
