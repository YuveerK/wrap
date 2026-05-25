import { apiClient } from "./client";

export async function listPosts() {
  return apiClient.get("/posts");
}

/** @param {number} id */
export async function getPost(id) {
  return apiClient.get(`/posts/${id}`);
}

/** @param {FormData} formData */
export async function createPostWithMedia(formData) {
  return apiClient.postMultipart("/posts", formData);
}

/** @param {number} id */
export async function toggleLike(id) {
  return apiClient.post(`/posts/${id}/like`);
}

/**
 * @param {number} postId
 * @param {{ body: string, parentId?: number }} payload
 */
export async function createComment(postId, payload) {
  return apiClient.post(`/posts/${postId}/comments`, payload);
}
