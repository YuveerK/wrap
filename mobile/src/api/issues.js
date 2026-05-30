import { apiClient } from "./client";

/**
 * @param {{ status?: string, category?: string }} [params]
 */
export async function listIssues(params = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.category) search.set("category", params.category);
  const query = search.toString();
  return apiClient.get(`/issues${query ? `?${query}` : ""}`);
}

/** @param {number} id */
export async function getIssue(id) {
  return apiClient.get(`/issues/${id}`);
}

/** @param {object} body */
export async function createIssue(body) {
  return apiClient.post("/issues", body);
}

/** @param {number} id */
export async function supportIssue(id) {
  return apiClient.post(`/issues/${id}/support`);
}

/** @param {number} id */
/** @param {{ status: string, note?: string }} body */
export async function updateIssueStatus(id, body) {
  return apiClient.patch(`/issues/${id}/status`, body);
}

/** @param {number} id @param {{ status: string }} body */
export async function reporterUpdateIssueStatus(id, body) {
  return apiClient.patch(`/issues/${id}/reporter-status`, body);
}

/** @param {number} id */
export async function watchIssue(id) {
  return apiClient.post(`/issues/${id}/watch`);
}

/** @param {number} id */
export async function unwatchIssue(id) {
  return apiClient.delete(`/issues/${id}/watch`);
}
