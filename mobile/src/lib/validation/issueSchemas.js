import { z } from "zod";

const issueCategory = z.enum([
  "POTHOLE",
  "ELECTRICITY",
  "WATER",
  "ROADS",
  "WASTE",
  "OTHER",
]);

export const createIssueSchema = z.object({
  category: issueCategory,
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z
    .string()
    .min(10, "Please describe the issue in more detail")
    .max(2000),
  addressText: z.string().max(200).optional().or(z.literal("")),
});

export const updateIssueStatusSchema = z.object({
  status: z.enum([
    "REPORTED",
    "ACKNOWLEDGED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
  ]),
  note: z.string().max(500).optional().or(z.literal("")),
});
