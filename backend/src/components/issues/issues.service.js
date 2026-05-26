import { IssueStatus } from "@prisma/client";
import * as issuesRepo from "./issues.repository.js";
import { ConflictError, NotFoundError } from "../../libraries/errors.js";

export async function listIssues(userId, filters) {
  return await issuesRepo.findIssues(filters);
}

export async function getIssueById(userId, issueId) {
  const issue = await issuesRepo.findIssueById(issueId);
  if (!issue) throw new NotFoundError("Issue");
  return issue;
}

export async function createIssue(userId, input) {
  const issue = await issuesRepo.createIssue({
    reporterId: userId,
    category: input.category,
    title: input.title,
    description: input.description,
    addressText: input.addressText ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    status: IssueStatus.REPORTED,
    updates: {
      create: {
        authorId: userId,
        status: IssueStatus.REPORTED,
        note: "Issue reported",
      },
    },
  });

  return await issuesRepo.findIssueById(issue.id);
}

export async function supportIssue(userId, issueId) {
  await getIssueById(userId, issueId);

  const existing = await issuesRepo.findSupport(issueId, userId);
  if (existing) throw new ConflictError("You already supported this issue");

  await issuesRepo.addSupport(issueId, userId);
  await issuesRepo.incrementSupportCount(issueId);

  return await issuesRepo.findIssueById(issueId);
}

export async function addIssueUpdate(userId, issueId, { status, note }) {
  const issue = await getIssueById(userId, issueId);

  if (status && status !== issue.status) {
    await issuesRepo.updateIssueStatus(issueId, status);
  }

  await issuesRepo.createIssueUpdate({
    issueId,
    authorId: userId,
    status: status ?? null,
    note,
  });

  return await issuesRepo.findIssueById(issueId);
}

export async function updateIssueStatus(userId, issueId, { status, note }) {
  await getIssueById(userId, issueId);
  await issuesRepo.updateIssueStatus(issueId, status);

  await issuesRepo.createIssueUpdate({
    issueId,
    authorId: userId,
    status,
    note: note ?? `Status changed to ${status.replace("_", " ").toLowerCase()}`,
  });

  return await issuesRepo.findIssueById(issueId);
}
