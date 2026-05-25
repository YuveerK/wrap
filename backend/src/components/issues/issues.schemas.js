import { z } from "zod";

const issueCategory = z.enum(["POTHOLE", "ELECTRICITY", "WATER", "ROADS", "WASTE", "OTHER"]);
const issueStatus = z.enum(["REPORTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"]);

export const createIssueSchema = z.object({
  category: issueCategory,
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  addressText: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const listIssuesQuerySchema = z.object({
  status: issueStatus.optional(),
  category: issueCategory.optional(),
});

export const updateIssueStatusSchema = z.object({
  status: issueStatus,
  note: z.string().max(500).optional(),
});

export const createIssueUpdateSchema = z.object({
  note: z.string().min(1).max(500),
  status: issueStatus.optional(),
});
