import { IssueStatus } from "@prisma/client";
import * as issuesRepo from "./issues.repository.js";
import { AppError, ConflictError, ForbiddenError, NotFoundError } from "../../libraries/errors.js";
import { isAllowedSuburb } from "../../libraries/suburbs.js";
import { sendPushNotifications } from "../notifications/notifications.service.js";

export async function listIssues(userId, filters) {
  return await issuesRepo.findIssues(filters);
}

export async function getIssueById(userId, issueId) {
  const issue = await issuesRepo.findIssueById(issueId);
  if (!issue) throw new NotFoundError("Issue");
  const watch = await issuesRepo.findWatch(issueId, userId);
  return { ...issue, watchedByMe: Boolean(watch) };
}

export async function createIssue(userId, input) {
  if (input.suburb && !isAllowedSuburb(input.suburb)) {
    throw new AppError(`${input.suburb} is outside the WJRA service area.`, {
      status: 422,
      code: "SUBURB_NOT_ALLOWED",
    });
  }

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

  const statusChanged = status && status !== issue.status;
  if (statusChanged) {
    await issuesRepo.updateIssueStatus(issueId, status);
  }

  await issuesRepo.createIssueUpdate({
    issueId,
    authorId: userId,
    status: status ?? null,
    note,
  });

  const updated = await issuesRepo.findIssueById(issueId);

  if (statusChanged) {
    const label = status.replace(/_/g, " ").toLowerCase();
    await _notifyWatchers(issueId, userId, issue, label);
  }

  return updated;
}

export async function updateIssueStatus(userId, issueId, { status, note }) {
  const issue = await getIssueById(userId, issueId);
  await issuesRepo.updateIssueStatus(issueId, status);

  await issuesRepo.createIssueUpdate({
    issueId,
    authorId: userId,
    status,
    note: note ?? `Status changed to ${status.replace(/_/g, " ").toLowerCase()}`,
  });

  const updated = await issuesRepo.findIssueById(issueId);

  const label = status.replace(/_/g, " ").toLowerCase();
  await _notifyWatchers(issueId, userId, issue, label);

  return updated;
}

export async function reporterUpdateStatus(userId, issueId, { status }) {
  const issue = await getIssueById(userId, issueId);
  if (issue.reporter.id !== userId) {
    throw new ForbiddenError("Only the reporter can update this issue's status");
  }
  await issuesRepo.updateIssueStatus(issueId, status);
  await issuesRepo.createIssueUpdate({
    issueId,
    authorId: userId,
    status,
    note: `Reporter marked as ${status.replace(/_/g, " ").toLowerCase()}`,
  });
  const label = status.replace(/_/g, " ").toLowerCase();
  await _notifyWatchers(issueId, userId, issue, label);
  return getIssueById(userId, issueId);
}

export async function watchIssue(userId, issueId) {
  await getIssueById(userId, issueId);
  const existing = await issuesRepo.findWatch(issueId, userId);
  if (existing) throw new ConflictError("Already watching this issue");
  await issuesRepo.addWatch(issueId, userId);
  return getIssueById(userId, issueId);
}

export async function unwatchIssue(userId, issueId) {
  await getIssueById(userId, issueId);
  const existing = await issuesRepo.findWatch(issueId, userId);
  if (!existing) throw new ConflictError("Not watching this issue");
  await issuesRepo.removeWatch(issueId, userId);
  return getIssueById(userId, issueId);
}

// Sends a status-change push to all watchers + the reporter, excluding the
// user who made the update (they already know what they did).
async function _notifyWatchers(issueId, updaterUserId, issue, label) {
  const watcherIds = await issuesRepo.getWatcherIds(issueId);
  const recipientSet = new Set(watcherIds);
  recipientSet.add(issue.reporter.id);
  recipientSet.delete(updaterUserId);
  const recipients = [...recipientSet];
  if (recipients.length === 0) return;
  const shortTitle =
    issue.title.length > 50 ? `${issue.title.slice(0, 50)}…` : issue.title;
  sendPushNotifications(recipients, {
    title: "Issue update",
    body: `"${shortTitle}" is now ${label}`,
    data: { screen: "IssueDetail", id: issueId },
  }).catch(() => {});
}
