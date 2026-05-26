import { prisma } from "../../libraries/prisma.js";
import { SAFE_USER_SELECT } from "../auth/auth.repository.js";

const issueListSelect = {
  id: true,
  category: true,
  title: true,
  description: true,
  status: true,
  addressText: true,
  supportCount: true,
  createdAt: true,
  updatedAt: true,
  reporter: { select: SAFE_USER_SELECT },
};

export async function createIssue(data) {
  return await prisma.issue.create({ data });
}

export async function findIssueById(id) {
  return await prisma.issue.findUnique({
    where: { id },
    include: {
      reporter: { select: SAFE_USER_SELECT },
      updates: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: SAFE_USER_SELECT } },
      },
    },
  });
}

export async function findIssues(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;

  return await prisma.issue.findMany({
    where,
    select: issueListSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function updateIssueStatus(id, status) {
  return await prisma.issue.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });
}

export async function createIssueUpdate(data) {
  return await prisma.issueUpdate.create({
    data,
    include: { author: { select: SAFE_USER_SELECT } },
  });
}

export async function addSupport(issueId, userId) {
  return await prisma.issueSupport.create({
    data: { issueId, userId },
  });
}

export async function findSupport(issueId, userId) {
  return await prisma.issueSupport.findUnique({
    where: { issueId_userId: { issueId, userId } },
  });
}

export async function incrementSupportCount(issueId) {
  return await prisma.issue.update({
    where: { id: issueId },
    data: { supportCount: { increment: 1 } },
    select: { supportCount: true },
  });
}
