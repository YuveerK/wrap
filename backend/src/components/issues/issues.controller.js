import * as issuesService from "./issues.service.js";

export async function listIssues(req, res, next) {
  try {
    const issues = await issuesService.listIssues(req.user.sub, req.validatedQuery);
    res.json({ issues });
  } catch (err) {
    next(err);
  }
}

export async function getIssue(req, res, next) {
  try {
    const issue = await issuesService.getIssueById(req.user.sub, Number(req.params.id));
    res.json({ issue });
  } catch (err) {
    next(err);
  }
}

export async function createIssue(req, res, next) {
  try {
    const issue = await issuesService.createIssue(req.user.sub, req.body);
    res.status(201).json({ issue });
  } catch (err) {
    next(err);
  }
}

export async function supportIssue(req, res, next) {
  try {
    const issue = await issuesService.supportIssue(req.user.sub, Number(req.params.id));
    res.json({ issue });
  } catch (err) {
    next(err);
  }
}

export async function addIssueUpdate(req, res, next) {
  try {
    const issue = await issuesService.addIssueUpdate(req.user.sub, Number(req.params.id), req.body);
    res.json({ issue });
  } catch (err) {
    next(err);
  }
}

export async function updateIssueStatus(req, res, next) {
  try {
    const issue = await issuesService.updateIssueStatus(req.user.sub, Number(req.params.id), req.body);
    res.json({ issue });
  } catch (err) {
    next(err);
  }
}
