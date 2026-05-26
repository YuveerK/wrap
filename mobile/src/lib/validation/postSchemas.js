import { z } from "zod";

export const POST_CATEGORIES = [
  "NOTICES",
  "SAFETY",
  "EVENTS",
  "LOST_AND_FOUND",
  "RECOMMENDATIONS",
];

export const createPostSchema = z.object({
  title: z.string().max(120).optional().or(z.literal("")),
  body: z.string().min(1, "Post cannot be empty").max(2000),
  category: z
    .enum(["NOTICES", "SAFETY", "EVENTS", "LOST_AND_FOUND", "RECOMMENDATIONS"])
    .default("NOTICES"),
});
